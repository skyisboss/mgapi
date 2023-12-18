import { Module } from '@nestjs/common';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import { TAddress } from './address.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([TAddress])],
  controllers: [AddressController],
  providers: [AddressService],
})
export class AddressModule {}
