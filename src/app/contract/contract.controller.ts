import { Body, Controller, Post } from '@nestjs/common'
import { ContractService } from './contract.service'
import { CreateDto, DetailDto, IndexDto, UpdateDto } from './contract.dto'
import { HttpResponse } from 'src/util/helper'
import { IdDto, OpenidDto } from '../wallet/wallet.dto'
import { customAlphabet } from 'nanoid'

@Controller('contract')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Post('/index')
  async index(@Body() body: IndexDto): Promise<any> {
    const res = await this.contractService.index(body)
    return HttpResponse.success(res)
  }

  @Post('/create')
  async create(@Body() body: CreateDto): Promise<any> {
    const res = await this.contractService.create(body)
    return HttpResponse.success(res)
  }

  @Post('/detail')
  async detail(@Body() body: DetailDto): Promise<any> {
    const res = await this.contractService.detail(body)
    return HttpResponse.success(res)
  }

  @Post('/update')
  async update(@Body() body: UpdateDto): Promise<any> {
    const res = await this.contractService.update(body)
    return HttpResponse.success(res)
  }
}
