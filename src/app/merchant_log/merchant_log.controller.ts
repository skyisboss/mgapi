import { Body, Controller, Post } from '@nestjs/common'
import { MerchantLogService } from './merchant_log.service'
import { HttpResponse } from 'src/util/helper'
import { DetailDto, RecordDto } from './merchant_log.dto'

@Controller('merchant/log')
export class MerchantLogController {
  constructor(private readonly merchantLogService: MerchantLogService) {}

  @Post('/record')
  async record(@Body() body: RecordDto): Promise<any> {
    const res = await this.merchantLogService.record(body)
    return HttpResponse.success(res)
  }

  @Post('/detail')
  async detail(@Body() body: DetailDto): Promise<any> {
    const res = await this.merchantLogService.detail(body)
    return HttpResponse.success(res)
  }
}
