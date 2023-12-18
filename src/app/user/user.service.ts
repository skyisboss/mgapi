import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ShortCode, md5 } from 'src/util/helper'
import { TUser } from './user.entity'
import { TBalance } from 'src/app/balance/balance.entity'
import { OpenidDto } from '../wallet/wallet.dto'
import { RegisterDto } from './user.dto'
import { TAddress } from '../address/address.entity'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(TUser) private readonly user: Repository<TUser>,
    @InjectRepository(TBalance) private readonly balance: Repository<TBalance>,
    @InjectRepository(TAddress) private readonly addressRepository: Repository<TAddress>,
  ) {}

  /**
   * 获取用户信息
   * @returns
   */
  async userinfo(dto: OpenidDto) {
    const res = await this.user.findOneBy({ openid: dto.openid })
    return res
  }

  /**
   * 注册用户
   * 1、创建用户
   * 2、创建钱包
   * 3、分配地址
   * @returns
   */
  async register(dto: RegisterDto) {
    await this.user.manager.connection.transaction(async manager => {
      try {
        //1、创建用户
        const user = new TUser()
        user.openid = dto.openid
        user.currency = 'cny'
        user.language = 'cn'
        user.nickname = dto.nickname
        user.rank = 1
        user.version = 1
        user.pin_code = ''
        user.invite_code = ShortCode.encode(dto.openid, 'i')

        const res = await manager.save(TUser, user)
        if (res === null) {
          throw new Error('创建用户失败 - 1')
        }

        //2、创建钱包
        const balances: TBalance[] = []
        // 批量创建
        ;['wallet', 'invate'].map(async x => {
          const data = new TBalance()
          data.uid = res.id
          data.openid = dto.openid
          data.account = x
          balances.push(data)
        })
        const res1 = await manager.save(TBalance, balances)
        if (res1 === null) {
          throw new Error('创建用户失败 - 2')
        }

        // 3、分配地址
        const data = new TAddress()
        data.openid = dto.openid
        data.tron_address = 'TMNXXt5vyCiSo8G4ydknZU7mx7rV8gbvvs'
        data.eth_address = '0xBb0177c45882F1E739f19bd1b00DfeCEe895f177'
        data.bsc_address = '0xBb0177c45882F1E739f19bd1b00DfeCEe895f177'
        data.version = 1
        data.created_at = new Date()

        const res2 = await manager.save(TAddress, data)
        if (res2 === null) {
          throw new Error('创建用户失败 - 3')
        }
      } catch (error) {
        throw new Error('创建用户失败 - 4')
      }
    })

    return await this.userinfo({ openid: dto.openid })
  }

  /**
   * 查询用户是否存在
   * @returns
   */
  async checkUser(openid: string, showEmptyError?: boolean) {
    const res = await this.user.findOneBy({ openid: openid })
    if (showEmptyError && res === null) {
      throw new Error('用户不存在')
    }
    return res
  }

  /**用户设置 */
  async setting(opt: {
    openid: string
    lang_code?: string
    currency?: string
    pin_code?: string
    account?: string
    remove?: boolean
  }) {
    const { openid } = opt
    const data = await this.user.findOneBy({ openid: openid })
    if (opt?.lang_code) {
      data.language = opt.lang_code
      return await this.user.save(data)
    }
    if (opt?.currency) {
      data.currency = opt.currency
      return await this.user.save(data)
    }
    if (opt?.pin_code) {
      data.pin_code = md5(data.openid + opt.pin_code + data.invite_code)
      return await this.user.save(data)
    }
    // 备份账户
    if (opt?.account) {
      // 查询是否存在
      const userinfo = await this.checkUser(opt.account)
      if (userinfo === null) {
        return [null, '用户不存在']
      }
      // 解绑操作
      if (opt.remove) {
        if (!userinfo.backup_account || userinfo.backup_account !== data.openid) {
          return [null, '无法与你的账户解绑']
        }
        // 执行解绑操作
        await this.user.update({ id: userinfo.id }, { backup_account: '' })
        data.backup_account = ''
        return [await this.user.save(data), '']
      } else {
        // 已经绑定过
        if (userinfo.backup_account) {
          return [null, '已经绑定过']
        }
        // 开始绑定
        await this.user.update({ id: userinfo.id }, { backup_account: data.openid })
        data.backup_account = opt.account
        return [await this.user.save(data), '']
      }
    }
  }

  /**申请转移资产 */
  async assetsTransfer(opt: { openid: string; account: string }) {
    const { openid, account } = opt
    const data = await this.user.findOne({
      where: {
        openid: openid,
        backup_account: account,
      },
    })

    if (data === null) {
      return false
    }
    return true
  }

  /**邀请统计 */
  async inviteDetail(opt: OpenidDto) {
    const userinfo = await this.user.findOneBy({ openid: opt.openid })
    const balance = await this.balance.findOneBy({
      uid: userinfo.id,
      account: 'invite',
    })
    const { trc20, bep20, erc20 } = balance
    return {
      invites: {
        count: 100,
      },
      balance: {
        trc20: trc20,
        bep20: bep20,
        erc20: erc20,
      },
    }
  }

  /**提取佣金 */
  async inviteWithdraw(opt: OpenidDto) {
    const userinfo = await this.user.findOneBy({ openid: opt.openid })
    const balance = await this.balance.findOneBy({
      uid: userinfo.id,
      account: 'invite',
    })

    const { trc20, bep20, erc20 } = balance
    if (trc20 + bep20 + erc20 > 0) {
      return true
    }

    return false
  }
}
