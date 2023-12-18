import { Module } from '@nestjs/common'
import { ClaimsController } from './claims.controller'
import { ClaimsService } from './claims.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TClaims } from './claims.entity'

@Module({
  imports: [TypeOrmModule.forFeature([TClaims])],
  controllers: [ClaimsController],
  providers: [ClaimsService],
})
export class ClaimsModule {}
