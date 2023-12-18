import { Body, Controller, Post } from '@nestjs/common'
import { HongbaoService } from './hongbao.service'
import { HttpResponse } from 'src/util/helper'
import { ClaimHongbao, FaHongbaoDto } from './hongbao.dto'

@Controller('hongbao')
export class HongbaoController {
  constructor(private readonly hongbaoService: HongbaoService) {}

  @Post('/send')
  async send(@Body() body: FaHongbaoDto) {
    const res = await this.hongbaoService.send(body)
    return HttpResponse.success(res)
  }

  @Post('/claim')
  async claim(@Body() body: ClaimHongbao) {
    const res = await this.hongbaoService.claim(body)
    return HttpResponse.success(res)
  }

  @Post('/info')
  async info(@Body() body: { link: string }) {
    const res = await this.hongbaoService.info(body)
    return HttpResponse.success(res)
  }
}
