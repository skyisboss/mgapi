import { Injectable } from '@nestjs/common'
import { TContract } from './contract.entity'
import { Not, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateDto, DetailDto, IndexDto, UpdateDto } from './contract.dto'
import { TBalance } from '../balance/balance.entity'
import { BalanceService } from '../balance/balance.service'
import { EthToWei, ShortCode, WeiToEth } from 'src/util/helper'
import { math_subtract } from 'src/util/math'
import { customAlphabet } from 'nanoid'

@Injectable()
export class ContractService {
  constructor(
    private readonly balanceService: BalanceService,
    @InjectRepository(TContract) private readonly contractRepository: Repository<TContract>,
    @InjectRepository(TBalance) private readonly balanceRepository: Repository<TBalance>,
  ) {}

  async index(dto: IndexDto) {
    const pageSize = 5
    const skip = (dto.page - 1) * pageSize

    const condition = dto.cate === 1 ? { owner: dto.openid } : { partner: dto.openid }
    const [res, total] = await Promise.all([
      this.contractRepository.find({ skip, take: pageSize, where: condition }),
      this.contractRepository.count({ where: condition }),
    ])

    if (res === null) {
      return null
    }

    return {
      rows: res.map(x => {
        x.amount = WeiToEth(x.amount, 6)
        return x
      }),
      total: total,
      size: pageSize,
      page: dto.page,
    }
  }

  async create(dto: CreateDto) {
    // 1、获取创建者余额
    const balance = await this.balanceService.balanceByOpenid(dto.openid, 'wallet')
    // 2、判断余额能否支付保证金
    const amount = EthToWei(Number(dto.amount), 6)
    const deposit = EthToWei(Number(dto.deposit), 6)
    const balanceRaw = math_subtract(balance[dto.token], deposit)
    if (balanceRaw < 0) {
      throw new Error('余额不足缴纳保证金')
    }

    // 3、事物操作，执行创建
    await this.balanceRepository.manager.transaction(async manager => {
      try {
        // 1、扣减余额
        const res = await manager.update(
          TBalance,
          { id: balance.id, version: balance.version },
          {
            [dto.token]: balanceRaw,
            version: balance.version + 1,
          },
        )
        if (res.affected === 0) {
          throw new Error('创建失败 - 1')
        }

        // 添加担保数据
        return await this.contractRepository.manager.transaction(async manager => {
          const link = customAlphabet('0123456789', 5)
          const data = new TContract()
          data.owner = dto.openid
          data.link = ShortCode.encode(link().toString() + Date.now().toString(), 'c')
          data.token = dto.token
          data.status = 1
          data.amount = amount
          data.deposit = deposit
          data.percent = Number(dto.percent)

          const res = await manager.save(data)
          if (res === null) {
            throw new Error('创建失败 - 2')
          }

          return res
        })
      } catch (error) {
        throw new Error('创建失败 - 3')
      }
    })
  }

  async detail(dto: DetailDto) {
    const res = await this.contractRepository.findOneBy({ id: dto.id })
    return res
  }

  async update(dto: UpdateDto) {
    const { openid, id, action, info } = dto
    const data = await this.contractRepository.findOne({
      where: { id, status: Not(0) },
    })

    if (data) {
      // 限甲方操作
      if (['content', 'close', 'delivery', 'payment'].includes(action) && data.owner !== openid) {
        throw new Error('操作失败')
      }
      // 限乙方操作
      if (['receive', 'receive2', 'payment2'].includes(action) && data.partner !== openid) {
        throw new Error('操作失败')
      }
      if (['join'].includes(action) && data.owner === openid) {
        throw new Error('不能加入自己的交易')
      }

      const condition = { id: data.id, version: data.version }
      /**
       * 状态
       * 0-关闭
       * 1-待完善content内容
       * 2-待买家加入
       * 3-卖家发货
       * 4-买家收货、打款
       * 5-卖家收款、交易完成
       */
      switch (action) {
        case 'close':
          if (data.status <= 2) {
            const setUpdate = {
              status: 0,
              version: data.version + 1,
            }
            await this.contractRepository.update(condition, setUpdate)
          } else {
            throw new Error('操作失败')
          }
          break
        case 'content':
          if (data.status === 1) {
            const setUpdate = {
              content: info,
              status: data.status + 1,
              version: data.version + 1,
            }
            await this.contractRepository.update(condition, setUpdate)
          } else {
            throw new Error('操作失败')
          }
          break
        case 'join':
          if (data.status === 2) {
            const setUpdate = {
              partner: info,
              status: data.status + 1,
              version: data.version + 1,
            }
            await this.contractRepository.update(condition, setUpdate)
          } else {
            throw new Error('操作失败')
          }
          break
        case 'delivery':
          if (data.status === 3) {
            const setUpdate = {
              status: data.status + 1,
              version: data.version + 1,
            }
            await this.contractRepository.update(condition, setUpdate)
          } else {
            throw new Error('操作失败')
          }
          break
        case 'delivery2':
          break
        case 'receive':
          if (data.status === 4) {
            const setUpdate = {
              status: data.status + 1,
              version: data.version + 1,
            }
            await this.contractRepository.update(condition, setUpdate)
          } else {
            throw new Error('操作失败')
          }
          break
        case 'receive2':
          break
        case 'payment':
          if (data.status === 5) {
            const setUpdate = {
              status: data.status + 1,
              version: data.version + 1,
            }
            await this.contractRepository.update(condition, setUpdate)
          } else {
            throw new Error('操作失败')
          }
          break
        case 'payment2':
          break
        default:
          throw new Error('操作失败')
      }

      return {}
    }

    return null
  }
}
