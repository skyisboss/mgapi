import { Transform } from 'class-transformer'
import {
  IsNotEmpty,
  IsIn,
  IsInt,
  Length,
  Matches,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
  IsString,
  Min,
  MIN,
  IsPositive,
  IsOptional,
} from 'class-validator'
import { IntersectionType } from '@nestjs/swagger'

export class OpenidDto {
  @Transform(({ value }) => {
    try {
      return Number(value).toString()
    } catch (error) {
      return value
    }
  })
  @IsNotEmpty({ message: 'openid 不能为空' })
  @Matches(/^[0-9]+$/, { message: 'openid 错误' })
  openid: string
}

export class IdDto {
  @Transform(({ value }) => {
    try {
      return Number(value)
    } catch (error) {
      return value
    }
  })
  @IsNotEmpty({ message: 'id 不能为空' })
  // @Matches(/^[1-9]+$/, { message: 'id 无效' })
  // @IsInt({ message: 'id 无效' })
  @IsPositive({ message: 'id 无效' })
  id: number
}

export class PageDto {
  @Transform(({ value }) => {
    try {
      return Number(value)
    } catch (error) {
      return value
    }
  })
  @IsNotEmpty({ message: 'page 不能为空' })
  // @Matches(/^[1-9]+$/, { message: 'page 无效' })
  @IsInt({ message: 'page 无效' })
  @IsPositive({ message: 'page 无效' })
  page: number
}

export class TokenDto {
  @IsNotEmpty({ message: 'token 不能为空' })
  @IsIn(['eth', 'tron', 'bnb', 'erc20', 'trc20', 'bep20'], {
    message: 'token 错误',
  })
  token: string
}
export class AmountDto {
  @IsNotEmpty({ message: 'amount 不能为空' })
  @Matches(/^(0*[1-9]\d*(\.\d{1,6})?|0*\.\d*[1-9]\d*|[1-9]\d*(\.\d{1,6})?)$/, { message: 'amount 错误' })
  amount: string
}

export class DepositDto extends IntersectionType(OpenidDto, TokenDto) {}

@ValidatorConstraint({ name: 'custom', async: false })
export class CustomValidator implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    const obj = args.object as WithdrawDto
    if (!obj?.address || !obj?.token) {
      return false
    }
    const regx = [
      {
        token: ['eth', 'erc20'],
        reg: /^0x[0-9a-fA-F]{40}$/,
      },
      {
        token: ['bnb', 'bep20'],
        reg: /^0x[0-9a-fA-F]{40}$/,
      },
      {
        token: ['trx', 'trc20'],
        reg: /^T[a-zA-HJ-NP-Z0-9]{33}$/,
      },
    ]

    let flag = false
    for (let index = 0; index < regx.length; index++) {
      const x = regx[index]
      if (x.token.includes(obj.token) && x.reg.test(obj.address)) {
        flag = true
        break
      }
    }

    return flag
  }

  // 在这里定义验证失败时的错误消息
  defaultMessage(args: ValidationArguments) {
    return `address 格式错误`
  }
}
export class WithdrawDto extends IntersectionType(OpenidDto, TokenDto, AmountDto) {
  @IsNotEmpty({ message: 'address 不能为空' })
  @Validate(CustomValidator)
  address: string
}

export class TransferDto extends IntersectionType(OpenidDto, TokenDto, AmountDto) {
  @IsNotEmpty({ message: 'touser 不能为空' })
  @Matches(/^[0-9]+$/, { message: 'touser 错误' })
  touser: string
}

export class HistoryDto extends IntersectionType(OpenidDto, PageDto) {
  @IsNotEmpty({ message: 'view 不能为空' })
  @IsInt({ message: 'view 错误' })
  view: number
}

export class HistoryDetailDto extends IntersectionType(OpenidDto) {
  @IsNotEmpty({ message: 'view 不能为空' })
  @IsInt({ message: 'view 错误' })
  view: number

  @IsNotEmpty({ message: 'id 不能为空' })
  @IsInt({ message: 'id 错误' })
  id: number
}
