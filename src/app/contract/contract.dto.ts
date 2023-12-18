import { Transform } from 'class-transformer'
import {
  IsNotEmpty,
  IsIn,
  IsInt,
  Length,
  IsOptional,
  MaxLength,
  ValidationArguments,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { IntersectionType } from '@nestjs/swagger'
import { IdDto, OpenidDto, PageDto } from '../wallet/wallet.dto'
import { TokenDto } from '../wallet/wallet.dto'

export class IndexDto extends IntersectionType(OpenidDto, PageDto) {
  @IsNotEmpty({ message: 'cate 不能为空' })
  @IsInt({ message: 'cate 错误' })
  @IsIn([1, 2], { message: 'cate 错误' })
  cate: number
}

export class CreateDto extends IntersectionType(OpenidDto, TokenDto) {
  @IsNotEmpty({ message: 'amount 不能为空' })
  amount: string

  @IsNotEmpty({ message: 'deposit 不能为空' })
  deposit: string

  @IsNotEmpty({ message: 'percent 不能为空' })
  percent: string
}

export class DetailDto extends IntersectionType(OpenidDto, IdDto) {
  @IsNotEmpty({ message: 'id 不能为空' })
  @IsInt({ message: 'id 错误' })
  id: number
}

export class UpdateDto extends IntersectionType(OpenidDto, IdDto) {
  @IsNotEmpty({ message: 'action 不能为空' })
  @IsIn(['content', 'join', 'close', 'delivery', 'delivery2', 'receive', 'receive2', 'payment', 'payment2'], {
    message: 'action 错误',
  })
  action: string

  @IsOptional()
  @IsNotEmpty({ message: 'info 不能为空' })
  @MaxLength(1024, { message: 'info 无效' })
  info?: string
}
