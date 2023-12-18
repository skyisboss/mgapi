import { Module } from '@nestjs/common'
import { TransferController } from './transfer.controller'
import { TransferService } from './transfer.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TTransfer } from './transfer.entity'

@Module({
  imports: [TypeOrmModule.forFeature([TTransfer])],
  controllers: [TransferController],
  providers: [TransferService],
})
export class TransferModule {}
