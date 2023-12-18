import { Injectable } from '@nestjs/common'
import { TBalance } from './balance.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BalanceOfDto } from './balance.dto'

@Injectable()
export class BalanceService {
  constructor(@InjectRepository(TBalance) private readonly balance: Repository<TBalance>) {}

  /**查询某个uid的余额 */
  async balanceByOpenid(openid: string, account: BalanceAccount) {
    // (openid: string, account: BalanceAccount | BalanceAccount[
    // const selectAccount = typeof account === 'string' ? [account] : account
    // this.balance.createQueryBuilder('entity').where('entity.account IN (:...ids)', selectAccount).getMany()
    const res = await this.balance.findOneBy({ openid, account })
    if (res === null) {
      throw new Error('数据不存在')
    }
    return res
  }

  async balanceOf(dto: BalanceOfDto) {
    const res = await this.balanceByOpenid(dto.openid, dto.account as BalanceAccount)
    if (dto.token) {
      return {
        balance: res?.[dto.token] ?? 0,
      }
    }
    return res
  }
}
type BalanceAccount = 'wallet' | 'invite' | 'merchant' | 'vending'
