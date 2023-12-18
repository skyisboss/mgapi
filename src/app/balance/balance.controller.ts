import { Body, Controller, Post } from '@nestjs/common'
import { BalanceService } from './balance.service'
import { BalanceOfDto } from './balance.dto'
import { HttpResponse } from 'src/util/helper'

@Controller('balance')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Post('balanceOf')
  async balanceOf(@Body() body: BalanceOfDto) {
    const res = await this.balanceService.balanceOf(body)
    return HttpResponse.success(res)
  }
}
