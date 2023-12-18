import { Transform } from 'class-transformer'
import { IsNotEmpty, IsIn, IsInt, Length, IsOptional } from 'class-validator'
import { IntersectionType } from '@nestjs/swagger'
import { OpenidDto } from '../wallet/wallet.dto'

export class SettingDto extends IntersectionType(OpenidDto) {
  @IsNotEmpty({ message: 'action 不能为空' })
  @IsIn(['name', 'describe', 'payment', 'status'], { message: 'action 无效' })
  action: string

  @IsNotEmpty({ message: 'value 不能为空' })
  value: string
}
