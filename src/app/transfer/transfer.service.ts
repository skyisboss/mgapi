import { Injectable } from '@nestjs/common'
import { TTransfer } from './transfer.entity'
import { In, Repository, SelectQueryBuilder } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { HistoryDetailDto, HistoryDto } from '../wallet/wallet.dto'
import { WeiToEth } from 'src/util/helper'

@Injectable()
export class TransferService {
  constructor(@InjectRepository(TTransfer) private readonly transferRepository: Repository<TTransfer>) {}

  /**查看记录 */
  async history(dto: HistoryDto) {
    // 定义范围和分页选项
    const pageSize = 5
    const paginationOptions = {
      page: dto.page,
      pageSize: pageSize,
    }

    // 使用 Between 条件和分页选项进行查询
    const [res, total] = await this.transferRepository.findAndCount({
      where: [
        {
          to_user: dto.openid,
        },
        {
          from_user: In([dto.openid, 'system-invite']),
        },
      ],
      skip: (paginationOptions.page - 1) * paginationOptions.pageSize,
      take: paginationOptions.pageSize,
    })
    if (res === null) {
      throw new Error('数据不存在')
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

  async detail(dto: HistoryDetailDto) {
    return await this.transferRepository.findOneBy({ id: dto.id })
  }
}
