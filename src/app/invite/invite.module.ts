import { Module } from '@nestjs/common'
import { InviteController } from './invite.controller'
import { InviteService } from './invite.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TInvite } from './invite.entity'
import { TBalance } from '../balance/balance.entity'
import { TDeposit } from '../deposit/deposit.entity'
import { TTransfer } from '../transfer/transfer.entity'

@Module({
  imports: [TypeOrmModule.forFeature([TInvite, TBalance, TDeposit, TTransfer])],
  controllers: [InviteController],
  providers: [InviteService],
})
export class InviteModule {}
