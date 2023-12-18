import { Transform } from 'class-transformer'
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsUrl, MaxLength, isURL } from 'class-validator'
import { IntersectionType } from '@nestjs/swagger'
import { IdDto, OpenidDto, PageDto } from '../wallet/wallet.dto'

export class TokenDto extends IntersectionType(OpenidDto) {
  @IsOptional()
  @IsNotEmpty({ message: 'reset 不能为空' })
  @IsBoolean({ message: 'reset 错误' })
  reset?: boolean
}

export class WebhookDto extends IntersectionType(OpenidDto) {
  @IsOptional()
  @IsNotEmpty({ message: 'webhook 不能为空' })
  @IsUrl({ protocols: ['http', 'https'] }, { message: 'webhook 无效' })
  @MaxLength(128, { message: 'webhook 无效' })
  webhook?: string
}
