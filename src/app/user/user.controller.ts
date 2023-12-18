import { BadRequestException, Body, Controller, Get, Post, Request } from '@nestjs/common'
import { UserService } from './user.service'
import { BalanceService } from 'src/app/balance/balance.service'
import { HttpResponse } from 'src/util/helper'
import { BackupAccountDto, CurrencyDto, LangDto, PinCodeDto, RegisterDto, TransferDto } from './user.dto'
import { OpenidDto } from '../wallet/wallet.dto'

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly balanceService: BalanceService,
  ) {}

  @Post('/config')
  async config(@Body() body): Promise<any> {
    const data = {
      bot_link: 'https://t.me/beikeBot',
      language: [
        { code: 'en', lang: 'English' },
        { code: 'cn', lang: '简体中文' },
      ],
      blockchain: [
        {
          chain: 'tron',
          token: 'trc20',
          symbol: 'usdt',
        },
        {
          chain: 'bsc',
          token: 'bep20',
          symbol: 'usdt',
        },
        {
          chain: 'eth',
          token: 'erc20',
          symbol: 'usdt',
        },
      ],
      currency: [
        { code: 'usd', symbol: '$' },
        { code: 'cny', symbol: '￥' },
        { code: 'php', symbol: '₱' },
      ],
      hongbao: ['hongbao1', 'hongbao2', 'hongbao3'],
      update_at: Date.now(),
    }

    return HttpResponse.success(data)
  }

  @Post('/info')
  async userinfo(@Body() body: OpenidDto): Promise<any> {
    const res = await this.userService.userinfo(body)
    if (res === null) {
      return HttpResponse.error({}, { err: 405 })
    }
    return HttpResponse.success(res)
  }
  @Post('register')
  async register(@Body() body: RegisterDto) {
    const res = await this.userService.register(body)
    return HttpResponse.success(res)
  }

  /**
   * 检测用户是否存在
   */
  @Post('/checkUser')
  async checkUser(@Body() body: OpenidDto): Promise<any> {
    const res = await this.userService.checkUser(body.openid)

    return HttpResponse.success(res)
  }

  @Post('/setting/lang')
  async settingLang(@Body() body: LangDto): Promise<any> {
    const res = await this.userService.setting(body)
    return HttpResponse.success(res)
  }

  @Post('/setting/currency')
  async settingCurrency(@Body() body: CurrencyDto): Promise<any> {
    const res = await this.userService.setting(body)
    return HttpResponse.success(res)
  }

  @Post('/setting/pincode')
  async settingPinCode(@Body() body: PinCodeDto): Promise<any> {
    const res = await this.userService.setting(body)
    return HttpResponse.success(res)
  }

  @Post('/setting/backup')
  async settingBackup(@Body() body: BackupAccountDto): Promise<any> {
    const result = await this.userService.setting(body)
    const [res, msg] = result as any
    if (res === null) {
      return HttpResponse.error({}, { msg })
    }
    return HttpResponse.success(res)
  }

  @Post('/assets/transfer')
  async assetsTransfer(@Body() body: TransferDto): Promise<any> {
    const res = await this.userService.assetsTransfer(body)
    return HttpResponse.success(res ? {} : null)
  }

  @Post('/invite/detail')
  async inviteDetail(@Body() body: OpenidDto): Promise<any> {
    const res = await this.userService.inviteDetail(body)
    return HttpResponse.success(res)
  }

  @Post('/invite/users')
  async inviteUsers(@Body() body: { openid: string; cate: string; page: number }): Promise<any> {
    return HttpResponse.success({})
  }

  @Post('/invite/withdraw')
  async inviteWithdraw(@Body() body: OpenidDto): Promise<any> {
    const res = await this.userService.inviteWithdraw(body)
    return res ? HttpResponse.success({}) : HttpResponse.error({}, { msg: '佣金余额不足' })
  }
}
