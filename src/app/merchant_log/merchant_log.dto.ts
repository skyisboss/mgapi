import { Transform } from 'class-transformer'
import { IsNotEmpty, IsIn, IsInt, Length } from 'class-validator'
import { IntersectionType } from '@nestjs/swagger'
import { IdDto, OpenidDto, PageDto } from '../wallet/wallet.dto'

export class RecordDto extends IntersectionType(OpenidDto, PageDto) {
  @IsNotEmpty({ message: 'item 不能为空' })
  @IsInt({ message: 'item 无效' })
  item: number
}

export class DetailDto extends IntersectionType(OpenidDto, IdDto) {}
