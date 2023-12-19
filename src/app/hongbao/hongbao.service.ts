import { Injectable } from '@nestjs/common'
import { THongbao } from './hongbao.entity'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { HistoryDetailDto, HistoryDto } from '../wallet/wallet.dto'
import { EthToWei, RandHongbao, ShortCode, WeiToEth } from 'src/util/helper'
import { ClaimHongbao, FaHongbaoDto } from './hongbao.dto'
import { TUser } from '../user/user.entity'
import { math_add, math_subtract } from 'src/util/math'
import { TBalance } from '../balance/balance.entity'
import { customAlphabet } from 'nanoid'
import { TClaims } from '../claims/claims.entity'

@Injectable()
export class HongbaoService {
  constructor(
    @InjectRepository(THongbao) private readonly hongbaoRepository: Repository<THongbao>,
    @InjectRepository(TClaims) private readonly claimsRepository: Repository<TClaims>,
    @InjectRepository(TUser) private readonly userRepository: Repository<TUser>,
    @InjectRepository(TBalance) private readonly balanceRepository: Repository<TBalance>,
  ) {}

  /**查看记录 */
  async history(data: HistoryDto) {
    const pageSize = 5
    const skip = (data.page - 1) * pageSize

    const [res, total] = await Promise.all([
      this.hongbaoRepository.find({ skip, take: pageSize, where: { openid: data.openid } }),
      this.hongbaoRepository.count({ where: { openid: data.openid } }),
    ])

    if (res === null) {
      return null
    }

    return {
      rows: res.map(x => {
        x.amount = WeiToEth(x.amount, 6)
        // x.token = x.token.toUpperCase()
        return x
      }),
      total: total,
      size: pageSize,
      page: data.page,
    }
  }

  async detail(dto: HistoryDetailDto) {
    const res = await this.hongbaoRepository.findOneBy({ id: dto.id })
    res.available_balance = JSON.parse(res.available_balance)
    return res
  }

  /**
   * 发红包
   * 红包类型 0-普通红包 1-专属红包 2-拼手气红包
   * TODO:: 过期红包
   */
  async send(dto: FaHongbaoDto) {
    const { openid, token, amount, type, touser, split } = dto
    if (type === '1') {
      if (!touser) {
        throw new Error('用户不存在')
      }
      const toUser = await this.userRepository.findOneBy({ openid: touser })
      if (toUser === null) {
        throw new Error('用户不存在')
      }
    }

    // 原始金额转换
    const amountRaw = EthToWei(amount, 6)

    let availableBalance = [amountRaw]
    // let availableBalance = [[amountRaw, '']]
    if (type === '2') {
      if (!Number(split)) {
        throw new Error('红包数量错误')
      }
      // 计算随机金额
      const randAmount = RandHongbao(Number(amount), Number(split))
      // 将金额转换到 eth
      availableBalance = randAmount.map(x => EthToWei(x, 6))
      // availableBalance = []
      // for (let index = 0; index < randAmount.length; index++) {
      //   const x = randAmount[index]
      //   const item = [EthToWei(x, 6), '']
      //   availableBalance.push(item)
      // }
      // availableBalance = availableBalance
    }

    // 判断余额是否足够
    const balance = await this.balanceRepository.findOneBy({ openid, account: 'wallet' })
    // 计算余额是否足够
    const balanceRaw = math_subtract(Number(balance[token]), amountRaw)
    if (balanceRaw < 0) {
      throw new Error('余额不足')
    }
    // 执行操作
    return await this.balanceRepository.manager.transaction(async manager => {
      try {
        // 1、扣减发送人余额
        const res1 = await manager.update(
          TBalance,
          { id: balance.id, version: balance.version },
          {
            [token]: balanceRaw,
            version: balance.version + 1,
          },
        )
        if (res1.affected === 0) {
          throw new Error('发红包失败 - 1')
        }

        // 2、添加发送记录
        const data = new THongbao()
        const link = customAlphabet('0123456789', 10)

        data.openid = openid
        data.type = Number(type)
        data.token = token
        data.amount = amountRaw
        data.touser = touser ?? ''
        data.available_claim = Number(split ?? 1)
        data.available_balance = JSON.stringify(availableBalance)
        data.link = ShortCode.encode(link(), 'h')

        const res2 = await manager.save(THongbao, data)
        if (res2 === null) {
          throw new Error('发红包失败 - 2')
        }

        return res2
      } catch (error) {
        throw new Error('发红包失败 - 3')
      }
    })
  }

  async info(dto: { link: string }) {
    const res = await this.hongbaoRepository.findOneBy({ link: dto.link })
    if (res === null) {
      throw new Error('红包不存在')
    }
    const available_balance = JSON.parse(res.available_balance) as any[]
    return {
      id: res.id,
      type: res.type,
      token: res.token,
      amount: WeiToEth(res.amount, 6),
      split: available_balance.length,
      touser: res.touser,
      link: res.link,
    }
  }

  /**
   * 领红包
   * 限制，不能领取自己的红包，不能重复领取
   */
  async claim(dto: ClaimHongbao) {
    const [hongbao, balance] = await Promise.all([
      this.hongbaoRepository.findOneBy({ link: dto.link }),
      this.balanceRepository.findOneBy({ openid: dto.openid, account: 'wallet' }),
    ])
    if (hongbao === null || balance === null) {
      throw new Error('红包不存在')
    }

    if (hongbao.available_claim === 0) {
      throw new Error('红包被领完了')
    }

    // 判断红包类型 1-专属用户， 2-拼手气红包
    if (hongbao.type === 1) {
      if (hongbao.touser !== dto.openid) {
        throw new Error('这是一个专属红包')
      }
    }
    // 计算领取金额，标记为已领取
    const available_balance = JSON.parse(hongbao.available_balance) as number[]
    let claimAmount = 0
    let claimIndex = 0
    if (hongbao.type === 2) {
      claimIndex = hongbao.available_claim - 1
    }

    claimAmount = available_balance?.[claimIndex] ?? 0
    if (claimAmount === 0) {
      throw new Error('领取失败 - 1')
    }

    // 添加领取记录
    await this.hongbaoRepository.manager.transaction(async manager => {
      try {
        // 标记已领取
        const res1 = await manager.update(
          THongbao,
          { id: hongbao.id, version: hongbao.version },
          {
            available_claim: claimIndex,
            version: hongbao.version + 1,
          },
        )
        if (res1.affected === 0) {
          throw new Error('领取失败 - 2')
        }

        // 添加领取记录
        const log = new TClaims()
        log.openid = dto.openid
        log.link = hongbao.link
        log.type = hongbao.type
        log.amount = claimAmount
        const res2 = await manager.save(TClaims, log)
        if (res2 === null) {
          throw new Error('领取失败 - 3')
        }

        // 添加领取人金额
        const res3 = await manager.update(
          TBalance,
          { id: balance.id, version: balance.version },
          {
            [hongbao.token]: math_add(balance[hongbao.token], claimAmount),
            version: balance.version + 1,
          },
        )
        if (res3.affected === 0) {
          throw new Error('领取失败 - 2')
        }
      } catch (error) {
        throw new Error('领取失败 - 3')
      }
    })

    return hongbao
  }
}
