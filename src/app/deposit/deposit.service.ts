import { Injectable } from '@nestjs/common'
import { TDeposit } from './deposit.entity'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { HistoryDetailDto, HistoryDto } from '../wallet/wallet.dto'
import { WeiToEth } from 'src/util/helper'

@Injectable()
export class DepositService {
  constructor(@InjectRepository(TDeposit) private readonly depositRepository: Repository<TDeposit>) {}

  /**查看记录 */
  async history(data: HistoryDto) {
    const pageSize = 5
    const skip = (data.page - 1) * pageSize

    const [res, total] = await Promise.all([
      this.depositRepository.find({
        skip,
        take: pageSize,
        where: {
          openid: data.openid,
        },
      }),
      this.depositRepository.count({ where: { openid: data.openid } }),
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
      page: data.page,
    }
  }

  async detail(dto: HistoryDetailDto) {
    return await this.depositRepository.findOneBy({ id: dto.id })
  }
}
