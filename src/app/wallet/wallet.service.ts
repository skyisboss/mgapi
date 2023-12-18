import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { TAddress } from 'src/app/address/address.entity'
import { AddressService } from 'src/app/address/address.service'
import { TBalance } from 'src/app/balance/balance.entity'
import { BalanceService } from 'src/app/balance/balance.service'
import { DepositDto, OpenidDto } from '../wallet/wallet.dto'
import { TUser } from 'src/app/user/user.entity'
import { EthToWei, WeiToEth } from 'src/util/helper'
import { Repository } from 'typeorm'
import { HistoryDto, TransferDto, WithdrawDto } from './wallet.dto'
import { math_add, math_div, math_multiply, math_subtract } from 'src/util/math'
import { TWithdraw } from '../withdraw/withdraw.entity'
import { TransferService } from '../transfer/transfer.service'
import { UserService } from '../user/user.service'
import { TTransfer } from '../transfer/transfer.entity'
import { THongbao } from '../hongbao/hongbao.entity'

@Injectable()
export class WalletService {
  constructor(
    private readonly addressService: AddressService,
    private readonly balanceService: BalanceService,
    private readonly transferService: TransferService,
    private readonly userService: UserService,
    @InjectRepository(TUser) private readonly userRepository: Repository<TUser>,
    @InjectRepository(TBalance)
    private readonly balanceRepository: Repository<TBalance>,
    @InjectRepository(TAddress)
    private readonly addressRepository: Repository<TAddress>,
    @InjectRepository(TWithdraw)
    private readonly withdrawRepository: Repository<TWithdraw>,
    @InjectRepository(TTransfer)
    private readonly transferRepository: Repository<TTransfer>,
    @InjectRepository(TTransfer)
    private readonly hongbaoSendRepository: Repository<THongbao>,
  ) {}

  async userByOpenid(openid: string) {
    const res = await this.userRepository.findOneBy({ openid })
    if (res === null) {
      return undefined
    }
    return res
  }

  /**获取钱包首页信息 */
  async walletIndex(dto: OpenidDto) {
    const [userinfo, balance] = await Promise.all([
      this.userService.userinfo({ openid: dto.openid }),
      this.balanceService.balanceByOpenid(dto.openid, 'wallet'),
    ])

    const { trc20, erc20, bep20 } = balance
    // 汇率,以 usd 计价。模拟数据
    const rates = await this.walletRate()
    // 币种小数点，wei转为eth的时候需要计算
    const decimalsList = {
      trc20: 6,
      erc20: 6,
      bep20: 6,
      trx: 6,
      bnb: 6,
      eth: 18,
    }
    // 需要计算法币汇率的币种
    const tokenList = { trc20, erc20, bep20 }

    let faitCount = 0
    Object.keys(tokenList).map(key => {
      // 获得币种
      const token = tokenList[key]
      // 币种小数点
      const decimals = decimalsList[key]
      // 币种汇率
      const rate: number = rates[key]
      // 换算成eth，计算汇率
      const token2rate = EthToWei(rate, decimals)
      const token2fait = math_div(token, token2rate)

      faitCount = math_add(faitCount, token2fait)
    })
    // 计算用户法币显示余额
    faitCount = math_multiply(faitCount, rates[userinfo.currency])

    const res = {
      fait: {
        raw: faitCount,
        str: faitCount.toLocaleString(),
      },
      trc20: {
        raw: Number(balance.trc20),
        str: WeiToEth(balance.trc20, 6).toLocaleString(),
      },
      erc20: {
        raw: Number(balance.erc20),
        str: WeiToEth(balance.erc20, 6).toLocaleString(),
      },
      bep20: {
        raw: Number(balance.bep20),
        str: WeiToEth(balance.bep20, 6).toLocaleString(),
      },
    }

    return res
  }

  /**获取汇率 */
  async walletRate() {
    // 汇率,以 usd 计价。模拟数据
    const rates = {
      trc20: 0.9,
      erc20: 0.9,
      bep20: 0.9,
      usd: 1,
      cny: 7.2,
      php: 59.8,
      updated_at: Date.now(),
    }

    return rates
  }

  /**充值地址 */
  async deposit(data: DepositDto) {
    const addressInfo = [
      {
        field: 'eth_address',
        token: ['eth', 'erc20'],
        min_amount: 0.5,
        max_amount: 10000,
      },
      {
        field: 'bsc_address',
        token: ['bnb', 'bep20'],
        min_amount: 0.5,
        max_amount: 10000,
      },
      {
        field: 'tron_address',
        token: ['trx', 'trc20'],
        min_amount: 0.5,
        max_amount: 10000,
      },
    ]
    const addressObj = await this.addressService.addressByOpenid(data.openid)
    const info = addressInfo.find(x => x.token.includes(data.token))
    const address = addressObj?.[info?.field] ?? ''
    return {
      address: address,
      min_amount: info.min_amount,
      max_amount: info.max_amount,
      qrcode: `https://qr.crypt.bot/?url=${address}`,
    }
  }

  /**
   * 提款，
   * TODO:: 计算提款手续费
   * 手续费 = 提款金额 * 手续费比例
   * 实际提款金额 = 提款金额 - 手续费
   */
  async withdraw(data: WithdrawDto) {
    const amountRaw = EthToWei(data.amount, 6)
    // 获取钱包余额
    const balance = await this.balanceService.balanceByOpenid(data.openid, 'wallet')
    // 计算余额是否足够
    const balanceRaw = math_subtract(Number(balance[data.token]), amountRaw)
    if (balanceRaw < 0) {
      throw new Error('余额不足')
    }

    // 事物操作，1、扣减余额 2、添加记录
    await this.balanceRepository.manager.transaction(async manager => {
      try {
        // 1、扣减余额
        const res = await manager.update(
          TBalance,
          { id: balance.id, version: balance.version },
          {
            [data.token]: balanceRaw,
            version: balance.version + 1,
          },
        )
        if (res.affected === 0) {
          throw new Error('error 1')
        }

        // 2、添加记录
        await this.withdrawRepository.manager.transaction(async txManager => {
          const add = new TWithdraw()
          add.openid = data.openid
          add.token = data.token
          add.address = data.address
          add.amount = amountRaw
          add.status = 1
          add.version = 1

          const res = await txManager.save(add)
          if (res === null) {
            throw new Error('error 2')
          }
        })
      } catch (error) {
        throw new Error('error 3')
      }
    })

    return true
  }

  /**
   * 钱包内转账
   * 1、查询收款人
   * 2、查看发送人余额
   * 3、操作转账
   */
  async transfer(dto: TransferDto) {
    if (dto.openid === dto.touser) {
      throw new Error('无法给自己转账')
    }
    // 0、原始金额转换
    const amountRaw = EthToWei(dto.amount, 6)
    // 校验
    const [touser, sendBalance, toBalance] = await Promise.all([
      this.userService.checkUser(dto.touser),
      this.balanceService.balanceByOpenid(dto.openid, 'wallet'),
      this.balanceService.balanceByOpenid(dto.touser, 'wallet'),
    ])
    if (touser === null || toBalance === null) {
      throw new Error('收款人不存在')
    }
    const sendBalanceRaw = math_subtract(Number(sendBalance[dto.token]), amountRaw)
    const toBalanceRaw = math_add(toBalance[dto.token], amountRaw)
    if (sendBalanceRaw < 0) {
      throw new Error('余额不足')
    }

    // 执行操作
    await this.balanceRepository.manager.transaction(async manager => {
      try {
        // 1、扣减发送人余额
        const res1 = await manager.update(
          TBalance,
          { id: sendBalance.id, version: sendBalance.version },
          {
            [dto.token]: sendBalanceRaw,
            version: sendBalance.version + 1,
          },
        )
        if (res1.affected === 0) {
          throw new Error('转账失败 - 1')
        }
        // 2、增加收款人余额
        const res2 = await manager.update(
          TBalance,
          { id: toBalance.id, version: toBalance.version },
          {
            [dto.token]: toBalanceRaw,
            version: toBalance.version + 1,
          },
        )
        if (res2.affected === 0) {
          throw new Error('转账失败 - 2')
        }

        // 3、添加转账记录
        const log = new TTransfer()
        log.from_user = dto.openid
        log.to_user = dto.touser
        log.token = dto.token
        log.amount = amountRaw
        log.version = 1
        log.status = 1

        const res3 = await manager.save(TTransfer, log)
        if (res3 === null) {
          throw new Error('转账失败 - 3')
        }
      } catch (error) {
        throw new Error('转账失败 - 4')
      }
    })

    return true
  }

  /**查看记录 */
  async depositHistory(data: HistoryDto) {}
  async transferHistory(data: HistoryDto) {}
  async withdrawHistory(data: HistoryDto) {}
  async hongbaoHistory(data: HistoryDto) {}
}
