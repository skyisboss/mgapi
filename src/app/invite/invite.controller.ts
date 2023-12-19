import { Controller, Post, Body } from '@nestjs/common'
import { InviteService } from './invite.service'
import { HttpResponse } from 'src/util/helper'
import { inviteUsersDto } from './invite.dto'
import { OpenidDto } from '../wallet/wallet.dto'

@Controller('invite')
export class InviteController {
  constructor(private readonly inviteService: InviteService) {}

  @Post('index')
  async index(@Body() body: OpenidDto): Promise<any> {
    const res = await this.inviteService.index(body)
    return HttpResponse.success(res)
  }

  @Post('detail')
  async detail(@Body() body: inviteUsersDto): Promise<any> {
    const res = await this.inviteService.detail(body)
    return HttpResponse.success(res)
  }

  @Post('withdraw')
  async withdraw(@Body() body: OpenidDto): Promise<any> {
    const res = await this.inviteService.withdraw(body)
    return HttpResponse.success(res)
  }
}
