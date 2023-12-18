import { Injectable } from '@nestjs/common'
import { TMerchant } from './merchant.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { OpenidDto } from '../wallet/wallet.dto'
import { BalanceService } from '../balance/balance.service'
import { UserService } from '../user/user.service'
import { TUser } from '../user/user.entity'
import { TBalance } from '../balance/balance.entity'
import { TokenDto, WebhookDto } from './merchant.dto'
import { customAlphabet } from 'nanoid'
import { math_add, math_multiply, math_subtract } from 'src/util/math'
import { TMerchantLog } from '../merchant_log/merchant_log.entity'

@Injectable()
export class MerchantService {
  constructor(
    private readonly balanceService: BalanceService,
    private readonly userService: UserService,
    @InjectRepository(TMerchant) private readonly merchantRepository: Repository<TMerchant>,
    @InjectRepository(TUser) private readonly userRepository: Repository<TUser>,
    @InjectRepository(TBalance) private readonly balanceRepository: Repository<TBalance>,
    @InjectRepository(TMerchantLog) private readonly merchantLogRepository: Repository<TMerchantLog>,
  ) {}

  async merchantByOpenid(openid: string) {
    const res = await this.merchantRepository.findOneBy({ openid: openid })
    if (res === null) {
      throw new Error('数据不存在')
    }
    return res
  }

  async index() {}

  async create(dto: OpenidDto) {
    // 1、判断前置条件
    const [userinfo, balance] = await Promise.all([
      this.userService.checkUser(dto.openid, true),
      this.balanceRepository.findOneBy({ openid: dto.openid, account: 'wallet' }),
    ])
    if (userinfo.merchant) {
      throw new Error('您已经开通')
    }
    const totalAmount = balance.bep20 + balance.erc20 + balance.trc20
    if (userinfo.rank < 5 && totalAmount < 50) {
      throw new Error('前置条件不符合')
    }
    // 2、执行创建操作
    await this.merchantRepository.manager.transaction(async manager => {
      const appid = customAlphabet('1234567890', 6)
      const token = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 26)

      const data = new TMerchant()
      data.openid = dto.openid
      data.appid = appid()
      data.appname = ''
      data.token = `${data.appid}:${token()}`

      const result = await manager.save(data)
      if (result === null) {
        throw new Error('开通失败 - 1')
      }

      await this.balanceRepository.manager.transaction(async manager => {
        const data = new TBalance()
        data.openid = dto.openid
        data.account = 'merchant'
        const res = await manager.save(data)
        if (res === null) {
          throw new Error('开通失败 - 2')
        }
      })

      await this.userRepository.manager.transaction(async manager => {
        const res = await manager.update(TUser, { id: userinfo.id }, { merchant: result.id })
        if (res.affected === 0) {
          throw new Error('开通失败 - 3')
        }
      })
    })

    return true
  }

  async token(dto: TokenDto) {
    const merchant = await this.merchantRepository.findOneBy({ openid: dto.openid })
    if (merchant === null) {
      throw new Error('token不存在')
    }
    if (dto.reset) {
      const appid = customAlphabet('1234567890', 6)
      const token = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 26)
      merchant.token = `${merchant.appid}:${token()}`
      await this.merchantRepository.save(merchant)
    }

    return merchant.token
  }

  async webhook(dto: WebhookDto) {
    const data = await this.merchantRepository.findOneBy({ openid: dto.openid })
    if (data === null) {
      throw new Error('数据不存在')
    }
    if (dto?.webhook && data.webhook !== dto.webhook) {
      // 修改
      data.webhook = dto.webhook
      await this.merchantRepository.save(data)
    }
    return { webhook: data?.webhook ?? '' }
  }

  async withdraw(dto: OpenidDto) {
    const merchant = await this.merchantByOpenid(dto.openid)
    if (!merchant.status) {
      throw new Error('禁止提款')
    }
    const [balance, walletBalance] = await Promise.all([
      this.balanceService.balanceByOpenid(dto.openid, 'merchant'),
      this.balanceService.balanceByOpenid(dto.openid, 'wallet'),
    ])

    // 可提取的币种
    const tokenList = ['bep20', 'erc20', 'trc20']
    let totalAmount = 0
    tokenList.map(key => {
      totalAmount += balance[key]
    })
    if (totalAmount <= 0) {
      throw new Error('余额不足')
    }

    // merchant余额转入wallet余额所需的手续费 5%,
    const fee = 5 / 100

    // 计算手续费
    type AmountType = {
      amount: number
      fee: number
      actual: number
    }
    const withdrawAmount: { [k: string]: AmountType } = {}
    tokenList.map(key => {
      const amount = balance[key] as number
      const payFee = math_multiply(amount, fee)
      const actualAmount = math_subtract(amount, payFee)
      // 扣除手续费后实际金额要大于0
      if (actualAmount > 0) {
        withdrawAmount[key] = {
          amount: amount,
          fee: payFee,
          actual: actualAmount,
        }
      }
    })

    // 执行操作，扣减merchant余额，增加wallet余额
    await this.balanceRepository.manager.transaction(async manager => {
      try {
        // 1、扣减merchant余额
        Object.keys(withdrawAmount).map(key => {
          balance[key] = 0
        })
        const res1 = await manager.update(
          TBalance,
          { id: balance.id, version: balance.version },
          { ...balance, ...{ version: balance.version + 1 } },
        )
        if (res1.affected === 0) {
          throw new Error('提款失败 - 1')
        }

        // 2、增加wallet余额
        Object.keys(withdrawAmount).map(key => {
          const actualAmount = math_add(walletBalance[key], withdrawAmount[key].actual)
          walletBalance[key] = actualAmount
        })
        const res2 = await manager.update(
          TBalance,
          { id: walletBalance.id, version: walletBalance.version },
          { ...walletBalance, ...{ version: walletBalance.version + 1 } },
        )
        if (res2.affected === 0) {
          throw new Error('提款失败 - 2')
        }

        // 添加记录
        await this.merchantLogRepository.manager.transaction(async manager => {
          Object.keys(withdrawAmount).map(async token => {
            const item = withdrawAmount[token]
            const data = new TMerchantLog()
            data.type = 2
            data.openid = dto.openid
            data.token = token
            data.amount = item.amount
            data.fee_amount = item.fee
            data.actual_amount = item.actual
            data.status = 1
            data.version = 1

            const res = await manager.save(TMerchantLog, data)
            if (res === null) {
              throw new Error('提款失败 - 3')
            }
          })
        })
      } catch (error) {
        throw new Error('提款失败 - 4')
      }
    })

    return true
  }
}
