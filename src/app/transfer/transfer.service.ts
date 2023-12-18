import { Injectable } from '@nestjs/common'
import { TTransfer } from './transfer.entity'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { HistoryDetailDto, HistoryDto } from '../wallet/wallet.dto'
import { WeiToEth } from 'src/util/helper'

@Injectable()
export class TransferService {
  constructor(@InjectRepository(TTransfer) private readonly transferRepository: Repository<TTransfer>) {}

  /**查看记录 */
  async history(data: HistoryDto) {
    const pageSize = 5
    const skip = (data.page - 1) * pageSize

    const [res, total] = await Promise.all([
      this.transferRepository.find({
        skip,
        take: pageSize,
        where: {
          from_user: data.openid,
        },
      }),
      this.transferRepository.count({ where: { from_user: data.openid } }),
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
    return await this.transferRepository.findOneBy({ id: dto.id })
  }
}
