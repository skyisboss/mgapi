import { Module } from '@nestjs/common'
import { MerchantController } from './merchant.controller'
import { MerchantService } from './merchant.service'
import { TMerchant } from './merchant.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BalanceService } from '../balance/balance.service'
import { UserService } from '../user/user.service'
import { TUser } from '../user/user.entity'
import { TBalance } from '../balance/balance.entity'
import { TMerchantLog } from '../merchant_log/merchant_log.entity'
import { TAddress } from '../address/address.entity'
import { TInvite } from '../invite/invite.entity'

@Module({
  imports: [TypeOrmModule.forFeature([TMerchant, TUser, TBalance, TMerchantLog, TAddress, TInvite])],
  controllers: [MerchantController],
  providers: [MerchantService, UserService, BalanceService],
})
export class MerchantModule {}
