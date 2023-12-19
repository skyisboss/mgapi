import { Module } from '@nestjs/common'
import { InviteController } from './invite.controller'
import { InviteService } from './invite.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TInvite } from './invite.entity'
import { TUser } from '../user/user.entity'
import { TBalance } from '../balance/balance.entity'

@Module({
  imports: [TypeOrmModule.forFeature([TInvite, TUser, TBalance])],
  controllers: [InviteController],
  providers: [InviteService],
})
export class InviteModule {}
