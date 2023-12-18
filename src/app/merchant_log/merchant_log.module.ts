import { Module } from '@nestjs/common'
import { MerchantLogController } from './merchant_log.controller'
import { MerchantLogService } from './merchant_log.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TMerchantLog } from './merchant_log.entity'

@Module({
  imports: [TypeOrmModule.forFeature([TMerchantLog])],
  controllers: [MerchantLogController],
  providers: [MerchantLogService],
})
export class MerchantLogModule {}
