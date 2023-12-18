import { Body, Controller, Post } from '@nestjs/common'
import { GoodsService } from './goods.service'
import { HttpResponse } from 'src/util/helper'
import { Id2Dto, EditDto, IndexDto } from './goods.dto'

@Controller('goods')
export class GoodsController {
  constructor(private readonly goodsService: GoodsService) {}

  @Post('index')
  async index(@Body() body: IndexDto) {
    const res = await this.goodsService.index(body)
    return HttpResponse.success(res)
  }

  @Post('detail')
  async detail(@Body() body: Id2Dto) {
    const res = await this.goodsService.detail(body)
    return HttpResponse.success(res)
  }

  @Post('edit')
  async edit(@Body() body: EditDto) {
    const res = await this.goodsService.edit(body)
    return HttpResponse.success(res)
  }

  @Post('delete')
  async delete(@Body() body: Id2Dto) {
    const res = await this.goodsService.delete(body)
    return HttpResponse.success(res)
  }
}
