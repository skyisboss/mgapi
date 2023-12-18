import { Injectable } from '@nestjs/common'
import { TMerchantLog } from './merchant_log.entity'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { DetailDto, RecordDto } from './merchant_log.dto'
import { WeiToEth } from 'src/util/helper'

@Injectable()
export class MerchantLogService {
  constructor(@InjectRepository(TMerchantLog) private readonly merchantLogRepository: Repository<TMerchantLog>) {}

  async record(dto: RecordDto) {
    const pageSize = 5
    const skip = (dto.page - 1) * pageSize

    const [res, total] = await Promise.all([
      this.merchantLogRepository.find({ skip, take: pageSize, where: { openid: dto.openid, type: dto.item } }),
      this.merchantLogRepository.count({ where: { openid: dto.openid, type: dto.item } }),
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

  async detail(dto: DetailDto) {
    const res = await this.merchantLogRepository.findOneBy({ openid: dto.openid, id: dto.id })
    if (res?.amount) {
      res.amount = WeiToEth(res.amount, 6)
    }
    return res
  }
}
