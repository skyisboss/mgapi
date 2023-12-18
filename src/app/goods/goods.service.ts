import { Injectable } from '@nestjs/common'
import { TGoods } from './goods.entity'
import { IsNull, Not, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { EditDto, Id2Dto, IndexDto } from './goods.dto'
import { EthToWei, WeiToEth } from 'src/util/helper'

@Injectable()
export class GoodsService {
  constructor(@InjectRepository(TGoods) private readonly goodsRepository: Repository<TGoods>) {}

  private async goodsById(id: number) {
    const data = await this.goodsRepository
      .createQueryBuilder('g')
      .where({ id })
      .andWhere('g.deleted_at IS NULL')
      .getOne()
    if (data === null) {
      throw new Error('数据不存在')
    }

    data.price = WeiToEth(data.price, 6)
    return data
  }

  async index(dto: IndexDto) {
    const pageSize = 5
    const skip = (dto.page - 1) * pageSize

    const condition = { openid: dto.openid, deleted_at: IsNull() }
    const [res, total] = await Promise.all([
      this.goodsRepository.find({ skip, take: pageSize, where: condition }),
      this.goodsRepository.count({ where: condition }),
    ])

    if (res === null) {
      return null
    }

    return {
      rows: res.map(x => {
        x.price = WeiToEth(x.price, 6)
        return x
      }),
      total: total,
      size: pageSize,
      page: dto.page,
    }
  }

  async edit(dto: EditDto) {
    const { id, title, price, describe, content } = dto

    if (dto?.id) {
      const data = await this.goodsById(dto.id)

      return await this.goodsRepository.update(
        { id: dto.id, version: data.version },
        {
          title,
          price: EthToWei(price, 6),
          describe,
          content,
          version: data.version + 1,
          updated_at: new Date(),
          // logs: JSON.stringify(logs),
        },
      )
    } else {
      const data = new TGoods()
      data.openid = dto.openid
      data.title = title
      data.price = EthToWei(price, 6)
      data.describe = describe
      data.content = content
      data.version = 1
      data.logs = '[]'
      return await this.goodsRepository.save(data)
    }
  }

  async delete(dto: Id2Dto) {
    const data = await this.goodsById(dto.id)
    const res = await this.goodsRepository.update(
      { id: dto.id, version: data.version },
      {
        deleted_at: new Date(),
        version: data.version + 1,
      },
    )

    return res.affected > 0 ? {} : null
  }

  async detail(dto: Id2Dto) {
    return await this.goodsById(dto.id)
  }
}
