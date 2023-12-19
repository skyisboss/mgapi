import { Module } from '@nestjs/common'
import { WalletService } from './wallet.service'
import { WalletController } from './wallet.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TUser } from 'src/app/user/user.entity'
import { TBalance } from 'src/app/balance/balance.entity'
import { UserService } from 'src/app/user/user.service'
import { BalanceService } from 'src/app/balance/balance.service'
import { TAddress } from 'src/app/address/address.entity'
import { AddressService } from 'src/app/address/address.service'
import { TWithdraw } from '../withdraw/withdraw.entity'
import { TTransfer } from '../transfer/transfer.entity'
import { TransferService } from '../transfer/transfer.service'
import { HongbaoService } from '../hongbao/hongbao.service'
import { THongbao } from '../hongbao/hongbao.entity'
import { WithdrawService } from '../withdraw/withdraw.service'
import { TDeposit } from '../deposit/deposit.entity'
import { DepositService } from '../deposit/deposit.service'
import { TClaims } from '../claims/claims.entity'
import { TInvite } from '../invite/invite.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([TUser, TBalance, TAddress, TWithdraw, TTransfer, THongbao, TDeposit, TClaims, TInvite]),
  ],
  controllers: [WalletController],
  providers: [
    WalletService,
    UserService,
    BalanceService,
    AddressService,
    TransferService,
    HongbaoService,
    WithdrawService,
    DepositService,
  ],
})
export class WalletModule {}
