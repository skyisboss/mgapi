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
  async history(dto: HistoryDto) {
    // 定义范围和分页选项
    const pageSize = 5
    const paginationOptions = {
      page: dto.page,
      pageSize: pageSize,
    }
    const [res, total] = await this.depositRepository.findAndCount({
      where: {
        openid: dto.openid,
      },
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
    return await this.depositRepository.findOneBy({ id: dto.id })
  }
}
