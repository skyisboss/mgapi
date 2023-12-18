import { Transform } from 'class-transformer'
import { IsNotEmpty, IsIn, IsInt, Length, IsOptional } from 'class-validator'
import { IntersectionType } from '@nestjs/swagger'
import { IdDto, OpenidDto, PageDto } from '../wallet/wallet.dto'

export class EditDto extends IntersectionType(OpenidDto) {
  @IsOptional()
  @IsNotEmpty({ message: 'desc 不能为空' })
  @IsInt({ message: 'id 无效' })
  id?: number

  @IsNotEmpty({ message: 'title 不能为空' })
  title: string

  @IsNotEmpty({ message: 'price 不能为空' })
  @IsInt({ message: 'price 无效' })
  price: number

  @IsNotEmpty({ message: 'describe 不能为空' })
  describe: string

  @IsNotEmpty({ message: 'content 不能为空' })
  content: string
}

export class Id2Dto extends IntersectionType(OpenidDto, IdDto) {}

export class IndexDto extends IntersectionType(OpenidDto, PageDto) {}
