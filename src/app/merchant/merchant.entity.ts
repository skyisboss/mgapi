import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm'

@Entity()
export class TMerchant {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  openid: string

  @Column()
  appid: string

  @Column()
  appname: string

  @Column()
  token: string

  @Column()
  webhook: string

  /**商户状态 1-正常 0-禁止 */
  @Column({ default: 1 })
  status: number

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date

  @CreateDateColumn({ type: 'timestamp' })
  updated_at: Date
}
