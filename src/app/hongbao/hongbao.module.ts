import { Module } from '@nestjs/common'
import { HongbaoController } from './hongbao.controller'
import { HongbaoService } from './hongbao.service'
import { THongbao } from './hongbao.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TUser } from '../user/user.entity'
import { TBalance } from '../balance/balance.entity'
import { TClaims } from '../claims/claims.entity'

@Module({
  imports: [TypeOrmModule.forFeature([THongbao, TUser, TBalance, TClaims])],
  controllers: [HongbaoController],
  providers: [HongbaoService],
})
export class HongbaoModule {}
