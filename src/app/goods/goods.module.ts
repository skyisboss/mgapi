import { Module } from '@nestjs/common'
import { GoodsController } from './goods.controller'
import { GoodsService } from './goods.service'
import { TGoods } from './goods.entity'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [TypeOrmModule.forFeature([TGoods])],
  controllers: [GoodsController],
  providers: [GoodsService],
})
export class GoodsModule {}
