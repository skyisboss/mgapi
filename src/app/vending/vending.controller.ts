import { Body, Controller, Post } from '@nestjs/common'
import { VendingService } from './vending.service'
import { HttpResponse } from 'src/util/helper'
import { OpenidDto } from '../wallet/wallet.dto'
import { SettingDto } from './vending.dto'

@Controller('vending')
export class VendingController {
  constructor(private readonly vendingService: VendingService) {}

  /**店铺首页信息，包含余额统计 */
  @Post('index')
  async index(@Body() body: OpenidDto) {
    const res = await this.vendingService.index(body)
    return HttpResponse.success(res)
  }

  /**店铺基本信息 */
  @Post('baseinfo')
  async baseinfo(@Body() body: OpenidDto) {
    const res = await this.vendingService.baseinfo(body)
    return HttpResponse.success(res)
  }

  @Post('create')
  async create(@Body() body: OpenidDto) {
    const res = await this.vendingService.create(body)
    return HttpResponse.success(res)
  }

  @Post('setting')
  async setting(@Body() body: SettingDto) {
    const res = await this.vendingService.setting(body)
    return HttpResponse.success(res)
  }
}
