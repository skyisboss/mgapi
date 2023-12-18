import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from './app/user/user.module'
import { BalanceModule } from './app/balance/balance.module'
import { WalletModule } from './app/wallet/wallet.module'
import { AddressModule } from './app/address/address.module'
import { WithdrawModule } from './app/withdraw/withdraw.module'
import { TransferModule } from './app/transfer/transfer.module'
import { DepositModule } from './app/deposit/deposit.module'
import { HongbaoModule } from './app/hongbao/hongbao.module'
import { MerchantModule } from './app/merchant/merchant.module'
import { MerchantLogModule } from './app/merchant_log/merchant_log.module'
import { ContractModule } from './app/contract/contract.module';
import { GoodsModule } from './app/goods/goods.module';
import { VendingModule } from './app/vending/vending.module';
import { ClaimsModule } from './app/claims/claims.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'mgapi',
      retryDelay: 500,
      retryAttempts: 10,
      // synchronize: true, // 同步实体
      autoLoadEntities: true,
      logging: ['query'], //日志
    }),
    UserModule,
    BalanceModule,
    WalletModule,
    AddressModule,
    WithdrawModule,
    DepositModule,
    TransferModule,
    HongbaoModule,
    MerchantModule,
    MerchantLogModule,
    ContractModule,
    GoodsModule,
    VendingModule,
    ClaimsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
