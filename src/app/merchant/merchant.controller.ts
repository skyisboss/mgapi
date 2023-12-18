import { Post, Body, Controller } from '@nestjs/common'
import { MerchantService } from './merchant.service'
import { HttpResponse } from 'src/util/helper'
import { OpenidDto } from '../wallet/wallet.dto'
import { TokenDto, WebhookDto } from './merchant.dto'
import { customAlphabet, nanoid } from 'nanoid'
import { IndexDto } from '../contract/contract.dto'

@Controller('merchant')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @Post('/index')
  async index(@Body() body: any): Promise<any> {
    return HttpResponse.success({})
  }

  @Post('/create')
  async create(@Body() body: OpenidDto): Promise<any> {
    const res = await this.merchantService.create(body)
    return HttpResponse.success(res)
  }

  @Post('/token')
  async token(@Body() body: TokenDto): Promise<any> {
    const res = await this.merchantService.token(body)
    return HttpResponse.success(res)
  }

  @Post('/webhook')
  async webhook(@Body() body: WebhookDto): Promise<any> {
    const res = await this.merchantService.webhook(body)
    return HttpResponse.success(res)
  }

  @Post('/withdraw')
  async withdraw(@Body() body: OpenidDto): Promise<any> {
    const res = await this.merchantService.withdraw(body)
    return HttpResponse.success(res)
  }
}
