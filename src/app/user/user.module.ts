import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TUser } from './user.entity'
import { BalanceService } from 'src/app/balance/balance.service'
import { TBalance } from 'src/app/balance/balance.entity'
import { TAddress } from '../address/address.entity'
import { TInvite } from '../invite/invite.entity'

@Module({
  imports: [TypeOrmModule.forFeature([TUser, TBalance, TAddress, TInvite])],
  controllers: [UserController],
  providers: [UserService, BalanceService],
})
export class UserModule {}
