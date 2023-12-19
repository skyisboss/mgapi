import { Transform } from 'class-transformer'
import { IsNotEmpty, IsIn, IsInt, Length, Matches, IsPositive } from 'class-validator'
import { IntersectionType } from '@nestjs/swagger'
import { OpenidDto, PageDto } from '../wallet/wallet.dto'

export class inviteUsersDto extends IntersectionType(OpenidDto, PageDto) {
  @Transform(({ value }) => {
    try {
      return Number(value)
    } catch (error) {
      return value
    }
  })
  @IsNotEmpty({ message: 'cate 不能为空' })
  @IsPositive({ message: 'cate 无效' })
  @IsIn([1, 2, 3, 4], { message: 'cate 无效' })
  cate: string
}
