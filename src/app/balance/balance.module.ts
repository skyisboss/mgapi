import { Module } from '@nestjs/common';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';
import { TBalance } from './balance.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([TBalance])],
  controllers: [BalanceController],
  providers: [BalanceService],
})
export class BalanceModule {}
