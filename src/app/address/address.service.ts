import { Injectable } from '@nestjs/common'
import { TAddress } from './address.entity'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(TAddress)
    private readonly addressRepository: Repository<TAddress>,
  ) {}

  /**根据openid获取地址 */
  async addressByOpenid(openid: string) {
    return await this.addressRepository.findOneBy({ openid })
  }
}
