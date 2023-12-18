import { Transform } from 'class-transformer'
import { IsNotEmpty, IsIn, IsInt, Length, IsOptional } from 'class-validator'
import { IntersectionType } from '@nestjs/swagger'
import { OpenidDto, TokenDto } from '../wallet/wallet.dto'

export class BalanceOfDto extends IntersectionType(OpenidDto) {
  @IsNotEmpty({ message: 'account 不能为空' })
  @IsIn(['wallet', 'invite', 'merchant', 'vending'], { message: 'account 无效' })
  account: string

  @IsOptional()
  @IsNotEmpty({ message: 'token 不能为空' })
  @IsIn(['eth', 'tron', 'bnb', 'erc20', 'trc20', 'bep20'], { message: 'token 无效' })
  token?: string
}
