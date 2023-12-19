import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ShortCode, md5 } from 'src/util/helper'
import { TUser } from './user.entity'
import { TBalance } from 'src/app/balance/balance.entity'
import { OpenidDto } from '../wallet/wallet.dto'
import { RegisterDto } from './user.dto'
import { TAddress } from '../address/address.entity'
import { TInvite } from '../invite/invite.entity'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(TUser) private readonly userRepository: Repository<TUser>,
    @InjectRepository(TBalance) private readonly balanceRepository: Repository<TBalance>,
    @InjectRepository(TAddress) private readonly addressRepository: Repository<TAddress>,
    @InjectRepository(TInvite) private readonly inviteRepository: Repository<TInvite>,
  ) {}

  /**
   * 获取用户信息
   * @returns
   */
  async userinfo(dto: OpenidDto) {
    const res = await this.userRepository.findOneBy({ openid: dto.openid })
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
    const { invite_code } = dto
    let inviteNew: TInvite = null
    if (invite_code) {
      // 根据所属邀请码的用户信息
      const inviteOwner = await this.userRepository.findOneBy({ invite_code })
      // 用户信息查询邀请表
      const inviteParent = await this.inviteRepository.findOneBy({ openid: inviteOwner.openid })
      inviteNew = new TInvite()
      inviteNew['lavel'] = 1
      inviteNew['parent'] = inviteOwner.openid
      inviteNew['openid'] = dto.openid
      inviteNew['created_at'] = new Date()
      // 根据parent判断用户的上级，默认层级=1
      if (inviteParent !== null) {
        // 获取上级代理的层级，累计+1即等于当前用户所处层级。
        // 这里的层级累计方便后台统计用户推广来源。但是佣金最多允许3层代理，所以具体的层级佣金在代理里实现。
        inviteNew['lavel'] = inviteParent.lavel + 1
      }
    }

    await this.userRepository.manager.connection.transaction(async manager => {
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

        // TODO::处理通过邀请链接注册的用户
        if (dto.invite_code && inviteNew !== null) {
          const resNew = await manager.save(TInvite, inviteNew)
          if (resNew === null) {
            throw new Error('创建用户失败 - 2')
          }
        }

        //2、创建钱包
        const balances: TBalance[] = []
        // 批量创建
        ;['wallet', 'invite'].map(async x => {
          const data = new TBalance()
          data.uid = res.id
          data.openid = dto.openid
          data.account = x
          balances.push(data)
        })
        const res1 = await manager.save(TBalance, balances)
        if (res1 === null) {
          throw new Error('创建用户失败 - 3')
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
          throw new Error('创建用户失败 - 4')
        }
      } catch (error) {
        throw new Error('创建用户失败 - 5')
      }
    })

    return await this.userinfo({ openid: dto.openid })
  }

  /**
   * 查询用户是否存在
   * @returns
   */
  async checkUser(openid: string, showEmptyError?: boolean) {
    const res = await this.userRepository.findOneBy({ openid: openid })
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
    const data = await this.userRepository.findOneBy({ openid: openid })
    if (opt?.lang_code) {
      data.language = opt.lang_code
      return await this.userRepository.save(data)
    }
    if (opt?.currency) {
      data.currency = opt.currency
      return await this.userRepository.save(data)
    }
    if (opt?.pin_code) {
      data.pin_code = md5(data.openid + opt.pin_code + data.invite_code)
      return await this.userRepository.save(data)
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
        await this.userRepository.update({ id: userinfo.id }, { backup_account: '' })
        data.backup_account = ''
        return [await this.userRepository.save(data), '']
      } else {
        // 已经绑定过
        if (userinfo.backup_account) {
          return [null, '已经绑定过']
        }
        // 开始绑定
        await this.userRepository.update({ id: userinfo.id }, { backup_account: data.openid })
        data.backup_account = opt.account
        return [await this.userRepository.save(data), '']
      }
    }
  }

  /**申请转移资产 */
  async assetsTransfer(opt: { openid: string; account: string }) {
    const { openid, account } = opt
    const data = await this.userRepository.findOne({
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
  async inviteDetail(dto: OpenidDto) {
    const [userinfo, balance] = await Promise.all([
      this.userinfo({ openid: dto.openid }),
      this.balanceRepository.findOneBy({
        openid: dto.openid,
        account: 'invite',
      }),
    ])

    if (userinfo === null || balance === null) {
      throw new Error('用户不存在')
    }
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
    const userinfo = await this.userRepository.findOneBy({ openid: opt.openid })
    const balance = await this.balanceRepository.findOneBy({
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
