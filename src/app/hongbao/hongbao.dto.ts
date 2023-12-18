import { Transform } from 'class-transformer'
import { IsNotEmpty, IsIn, IsInt, Length, IsOptional, Matches } from 'class-validator'
import { IntersectionType } from '@nestjs/swagger'
import { AmountDto, OpenidDto, TokenDto } from '../wallet/wallet.dto'

export class FaHongbaoDto extends IntersectionType(OpenidDto, TokenDto, AmountDto) {
  @IsNotEmpty({ message: 'type 不能为空' })
  @IsIn(['0', '1', '2'], { message: 'type 错误' })
  type: string

  @IsOptional()
  @IsNotEmpty({ message: 'touser 不能为空' })
  @Matches(/^[0-9]+$/, { message: 'touser 错误' })
  touser?: string

  @IsOptional()
  @IsNotEmpty({ message: 'split 不能为空' })
  @Matches(/^[0-9]+$/, { message: 'split 错误' })
  split?: string
}

export class ClaimHongbao extends IntersectionType(OpenidDto) {
  @IsNotEmpty({ message: 'link 不能为空' })
  @Matches(/^h[a-zA-Z0-9]{1,}$/, { message: 'link 错误' })
  link: string
}
