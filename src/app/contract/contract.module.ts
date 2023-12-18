import { Module } from '@nestjs/common'
import { ContractController } from './contract.controller'
import { ContractService } from './contract.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TContract } from './contract.entity'
import { TBalance } from '../balance/balance.entity'
import { BalanceService } from '../balance/balance.service'

@Module({
  imports: [TypeOrmModule.forFeature([TContract, TBalance])],
  controllers: [ContractController],
  providers: [ContractService, BalanceService],
})
export class ContractModule {}
