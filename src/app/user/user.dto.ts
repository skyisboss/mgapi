import { Transform } from 'class-transformer'
import { IsNotEmpty, IsIn, IsInt, Length } from 'class-validator'
import { IntersectionType } from '@nestjs/swagger'
import { OpenidDto } from '../wallet/wallet.dto'

export class RegisterDto extends IntersectionType(OpenidDto) {
  @IsNotEmpty({ message: 'nickname 不能为空' })
  nickname: string
}

export class TransferDto extends IntersectionType(OpenidDto) {
  @IsNotEmpty({ message: 'account不能为空' })
  account: string
}

export class LangDto extends IntersectionType(OpenidDto) {
  @IsNotEmpty({ message: 'lang_code不能为空' })
  @IsIn(['cn', 'en'], { message: 'lang_code错误' })
  lang_code: string
}

export class CurrencyDto extends IntersectionType(OpenidDto) {
  @IsNotEmpty({ message: 'currency 不能为空' })
  @IsIn(['cny', 'usd', 'php'], { message: 'currency 错误' })
  currency: string
}

export class PinCodeDto extends IntersectionType(OpenidDto) {
  @IsNotEmpty({ message: 'pin_code 不能为空' })
  @Length(6, 6, { message: 'pin_code 错误' })
  pin_code: string
}

export class BackupAccountDto extends IntersectionType(OpenidDto) {
  @IsNotEmpty({ message: 'account 不能为空' })
  account: string

  remove?: boolean
}

export class DepositDto extends IntersectionType(OpenidDto) {
  @IsNotEmpty({ message: 'token 不能为空' })
  token: string
}
