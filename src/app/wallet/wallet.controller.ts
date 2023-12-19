import { Body, Controller, Post } from '@nestjs/common'
import { BalanceService } from 'src/app/balance/balance.service'
// import { DepositDto } from 'src/app/user/user.dto'
import { UserService } from 'src/app/user/user.service'
import { WalletService } from './wallet.service'
import { HttpResponse, WeiToEth } from 'src/util/helper'
import { DepositDto, HistoryDetailDto, HistoryDto, OpenidDto, TransferDto, WithdrawDto } from './wallet.dto'
import { HongbaoService } from '../hongbao/hongbao.service'
import { WithdrawService } from '../withdraw/withdraw.service'
import { TransferService } from '../transfer/transfer.service'
import { DepositService } from '../deposit/deposit.service'

@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly userService: UserService,
    private readonly balanceService: BalanceService,
    private readonly hongbaoService: HongbaoService,
    private readonly withdrawService: WithdrawService,
    private readonly transferService: TransferService,
    private readonly depositService: DepositService,
  ) {}

  @Post('/index')
  async index(@Body() body: OpenidDto) {
    const res = await this.walletService.walletIndex(body)
    return HttpResponse.success(res)
  }

  @Post('/rate')
  async rate() {
    const res = await this.walletService.walletRate()
    return HttpResponse.success(res)
  }

  @Post('/deposit')
  async deposit(@Body() body: DepositDto) {
    const res = await this.walletService.deposit(body)
    return HttpResponse.success(res)
  }

  @Post('/withdraw')
  async withdraw(@Body() body: WithdrawDto) {
    const res = await this.walletService.withdraw(body)
    return res ? HttpResponse.success() : HttpResponse.error()
  }

  @Post('/transfer')
  async transfer(@Body() body: TransferDto) {
    const res = await this.walletService.transfer(body)
    return HttpResponse.success()
  }

  @Post('/history/index')
  async historyIndex(@Body() body: HistoryDto) {
    const items = ['deposit', 'transfer', 'withdraw', 'hongbao']

    let res: {
      rows: any[]
      total: number
      size: number
      page: number | string
    }
    switch (items[body.view]) {
      case 'deposit':
        res = await this.depositService.history(body)
        break
      case 'transfer':
        res = await this.transferService.history(body)
        break
      case 'withdraw':
        res = await this.withdrawService.history(body)
        break
      case 'hongbao':
        res = await this.hongbaoService.history(body)
        break
    }
    return res ? HttpResponse.success(res) : HttpResponse.error()
  }

  @Post('/history/detail')
  async historyDetail(@Body() body: HistoryDetailDto) {
    const items = ['deposit', 'transfer', 'withdraw', 'hongbao']
    let res: any
    switch (items[body.view]) {
      case 'deposit':
        res = await this.depositService.detail(body)
        break
      case 'transfer':
        res = await this.transferService.detail(body)
        break
      case 'withdraw':
        res = await this.withdrawService.detail(body)
        break
      case 'hongbao':
        res = await this.hongbaoService.detail(body)
        break
    }
    if (res?.amount) {
      res.amount = WeiToEth(res.amount, 6)
    }
    return res ? HttpResponse.success(res) : HttpResponse.error()
  }
}
