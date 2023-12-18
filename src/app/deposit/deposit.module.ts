import { Module } from '@nestjs/common'
import { DepositController } from './deposit.controller'
import { DepositService } from './deposit.service'
import { TDeposit } from './deposit.entity'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [TypeOrmModule.forFeature([TDeposit])],
  controllers: [DepositController],
  providers: [DepositService],
})
export class DepositModule {}
