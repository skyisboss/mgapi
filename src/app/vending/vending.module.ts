import { Module } from '@nestjs/common'
import { VendingController } from './vending.controller'
import { VendingService } from './vending.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TVending } from './vending.entity'
import { TUser } from '../user/user.entity'
import { BalanceService } from '../balance/balance.service'
import { TBalance } from '../balance/balance.entity'

@Module({
  imports: [TypeOrmModule.forFeature([TVending, TUser, TBalance])],
  controllers: [VendingController],
  providers: [VendingService],
})
export class VendingModule {}
