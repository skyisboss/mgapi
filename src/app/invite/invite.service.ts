import { Injectable } from '@nestjs/common'
import { Between, Not, IsNull, Repository, FindOperator, In } from 'typeorm'
import { TInvite } from './invite.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { subDays, startOfToday, endOfToday } from 'date-fns'
import { inviteUsersDto } from './invite.dto'
import { OpenidDto } from '../wallet/wallet.dto'
import { TBalance } from '../balance/balance.entity'
import { WeiToEth } from 'src/util/helper'
import { math_add } from 'src/util/math'
import { TDeposit } from '../deposit/deposit.entity'
import { TTransfer } from '../transfer/transfer.entity'

@Injectable()
export class InviteService {
  constructor(
    @InjectRepository(TInvite) private readonly inviteRepository: Repository<TInvite>,
    @InjectRepository(TBalance) private readonly balanceRepository: Repository<TBalance>,
  ) {}

  async index(dto: OpenidDto) {
    const [count, balance] = await Promise.all([
      this.inviteRepository.count({ where: { openid: dto.openid } }),
      this.balanceRepository.findOneBy({
        openid: dto.openid,
        account: 'invite',
      }),
    ])

    if (balance === null) {
      throw new Error('用户不存在')
    }
    const { trc20, bep20, erc20 } = balance
    return {
      invites: {
        count: count,
      },
      balance: {
        trc20: WeiToEth(trc20, 6),
        bep20: WeiToEth(bep20, 6),
        erc20: WeiToEth(erc20, 6),
      },
    }
  }

  async detail(dto: inviteUsersDto) {
    const todayStart = startOfToday()
    const todayEnd = endOfToday()
    // ['', '全部','今日','昨日', '近30天']
    const categorys = [
      '',
      Not(IsNull()),
      Between(todayStart, todayEnd),
      Between(subDays(todayStart, 1), subDays(todayEnd, 1)),
      Between(subDays(todayStart, 29), todayEnd),
    ] as unknown as Date | FindOperator<Date>

    // 定义范围和分页选项
    const pageSize = 5
    const paginationOptions = {
      page: dto.page,
      pageSize: pageSize,
    }
    // 使用 Between 条件和分页选项进行查询
    const [res, total] = await this.inviteRepository.findAndCount({
      where: {
        parent: dto.openid,
        created_at: categorys[dto?.cate ?? 1],
      },
      skip: (paginationOptions.page - 1) * paginationOptions.pageSize,
      take: paginationOptions.pageSize,
    })

    return {
      rows: res,
      total: total,
      size: pageSize,
      page: dto.page,
    }
  }

  async withdraw(dto: OpenidDto) {
    const balance = await this.balanceRepository.find({
      where: {
        openid: dto.openid,
        account: In(['invite', 'wallet']),
      },
    })
    if (balance === null) {
      throw new Error('用户不存在')
    }
    const invite = balance.find(x => x.account === 'invite')
    const wallet = balance.find(x => x.account === 'wallet')

    const { trc20, bep20, erc20 } = invite
    if (trc20 + bep20 + erc20 <= 0) {
      throw new Error('余额不足')
    }

    await this.balanceRepository.manager.transaction(async manager => {
      try {
        // 1、扣减 invite 余额
        const res1 = await manager.update(
          TBalance,
          { id: invite.id, version: invite.version },
          {
            trc20: 0,
            bep20: 0,
            erc20: 0,
            version: invite.version + 1,
          },
        )
        if (res1.affected === 0) {
          throw new Error('提取失败 - 1')
        }

        // 2、增加 wallet 余额
        const res2 = await manager.update(
          TBalance,
          { id: wallet.id, version: wallet.version },
          {
            trc20: math_add(wallet.trc20, invite.trc20),
            bep20: math_add(wallet.bep20, invite.bep20),
            erc20: math_add(wallet.erc20, invite.erc20),
            version: wallet.version + 1,
          },
        )
        if (res2.affected === 0) {
          throw new Error('提取失败 - 2')
        }

        // 3、添加到转账记录表
        const obj = [
          { token: 'trc20', amount: invite.trc20 },
          { token: 'bep20', amount: invite.bep20 },
          { token: 'erc20', amount: invite.erc20 },
        ]
        const logs: TTransfer[] = []
        obj.map(x => {
          if (x.amount > 0) {
            const log = new TTransfer()
            log.from_user = 'system-invite'
            log.to_user = dto.openid
            log.amount = x.amount
            log.token = x.token
            log.status = 1
            log.created_at = new Date()
            logs.push(log)
          }
        })
        const res3 = await manager.save(TTransfer, logs)

        if (res3.length === 0) {
          throw new Error('提取失败 - 3')
        }
      } catch (error) {
        throw new Error('提取失败 - 4')
      }
    })

    return {}
  }
}
