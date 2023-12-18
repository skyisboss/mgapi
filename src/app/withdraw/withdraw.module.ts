import { Module } from '@nestjs/common';
import { WithdrawController } from './withdraw.controller';
import { WithdrawService } from './withdraw.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TWithdraw } from './withdraw.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TWithdraw])],
  controllers: [WithdrawController],
  providers: [WithdrawService],
})
export class WithdrawModule {}
