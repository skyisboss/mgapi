import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TVending } from './vending.entity'
import { OpenidDto } from '../wallet/wallet.dto'
import { TUser } from '../user/user.entity'
import { BalanceService } from '../balance/balance.service'
import { TBalance } from '../balance/balance.entity'
import { customAlphabet } from 'nanoid'
import { ShortCode } from 'src/util/helper'
import { SettingDto } from './vending.dto'

@Injectable()
export class VendingService {
  constructor(
    @InjectRepository(TVending) private readonly vendingRepository: Repository<TVending>,
    @InjectRepository(TUser) private readonly userRepository: Repository<TUser>,
    @InjectRepository(TBalance) private readonly balanceRepository: Repository<TBalance>,
  ) {}

  async create(dto: OpenidDto) {
    const userinfo = await this.userRepository.findOneBy({ openid: dto.openid })
    if (userinfo === null) {
      return null
    }
    if (userinfo.vending) {
      throw new Error('已经开通店铺')
    }

    await this.vendingRepository.manager.transaction(async manager => {
      const data = new TVending()
      const link = customAlphabet('0123456789', 10)
      data.openid = dto.openid
      data.status = 1
      data.link = ShortCode.encode(link(), 'v')

      try {
        const res = await manager.save(data)
        if (res === null) {
          throw new Error('开通失败 - 1')
        }

        await this.balanceRepository.manager.transaction(async manager => {
          const data = new TBalance()
          data.openid = dto.openid
          data.account = 'vending'
          const res = await manager.save(data)
          if (res === null) {
            throw new Error('开通失败 - 2')
          }
        })

        await this.userRepository.manager.transaction(async manager => {
          const res2 = await manager.update(TUser, { id: userinfo.id }, { vending: res.id })
          if (res2.affected === 0) {
            throw new Error('开通失败 - 3')
          }
        })
      } catch (error) {
        throw new Error('开通失败 - 4')
      }

      return {}
    })
  }

  async baseinfo(dto: OpenidDto) {
    const res = await this.vendingRepository.findOneBy({ openid: dto.openid })
    if (res?.payment) {
      res.payment = JSON.parse(res.payment)
    }
    return res
  }

  async index(dto: OpenidDto) {
    const [shop, balance] = await Promise.all([
      this.vendingRepository.findOneBy({ openid: dto.openid }),
      this.balanceRepository.findOneBy({ openid: dto.openid, account: 'vending' }),
    ])
    if (shop === null || balance === null) {
      throw new Error('店铺不存在')
    }

    return {
      ...shop,
      ...{
        payment: JSON.parse(shop.payment),
        amount: {
          trc20: balance.trc20,
          erc20: balance.erc20,
          bep20: balance.bep20,
        },
      },
    }
  }

  async setting(dto: SettingDto) {
    const { action, value } = dto
    const data = await this.vendingRepository.findOneBy({ openid: dto.openid })
    if (data === null) {
      throw new Error('数据不存在')
    }
    switch (action) {
      case 'name':
        data.name = value
        break
      case 'describe':
        data.describe = value
        break
      case 'payment':
        const payment = JSON.parse(data.payment) as string[]
        if (payment.includes(value)) {
          const val = payment.filter(x => x !== value)
          data.payment = JSON.stringify(val)
        } else {
          payment.push(value)
          data.payment = JSON.stringify(payment)
        }
        break
      case 'status':
        data.status = Number(value)
        break
    }
    data.updated_at = new Date()
    return await this.vendingRepository.save(data)
  }
}
