import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TWithdraw } from './withdraw.entity'
import { HistoryDetailDto, HistoryDto } from '../wallet/wallet.dto'
import { WeiToEth } from 'src/util/helper'

@Injectable()
export class WithdrawService {
  constructor(
    @InjectRepository(TWithdraw)
    private readonly withdrawRepository: Repository<TWithdraw>,
  ) {}

  /**添加提款记录 */
  async add(params: { openid: string; address: string; token: string; amount: number }) {
    const data = new TWithdraw()
    data.openid = params.openid
    data.address = params.address
    data.token = params.token
    data.amount = params.amount
    return await this.withdrawRepository.save(data)
  }

  /**查看记录 */
  async history(dto: HistoryDto) {
    // 定义范围和分页选项
    const pageSize = 5
    const paginationOptions = {
      page: dto.page,
      pageSize: pageSize,
    }
    const [res, total] = await this.withdrawRepository.findAndCount({
      where: {
        openid: dto.openid,
      },
      skip: (paginationOptions.page - 1) * paginationOptions.pageSize,
      take: paginationOptions.pageSize,
    })
    if (res === null) {
      throw new Error('数据不存在')
    }

    // const pageSize = 5
    // const skip = (data.page - 1) * pageSize

    // const [res, total] = await Promise.all([
    //   this.withdrawRepository.find({
    //     skip,
    //     take: pageSize,
    //     where: {
    //       openid: data.openid,
    //     },
    //   }),
    //   this.withdrawRepository.count({ where: { openid: data.openid } }),
    // ])
    // if (res === null) {
    //   return null
    // }

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
    return await this.withdrawRepository.findOneBy({ id: dto.id })
  }
}
