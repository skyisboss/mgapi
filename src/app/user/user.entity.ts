import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm'

@Entity()
export class TUser {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  openid: string

  @Column()
  rank: number

  @Column()
  username: string

  @Column()
  nickname: string

  @Column()
  language: string

  @Column()
  currency: string

  @Column()
  pin_code: string

  @Column()
  invite_code: string

  @Column()
  backup_account: string

  @Column()
  merchant: number

  @Column()
  vending: number

  @Column({ default: 1 })
  version: number

  @CreateDateColumn({ type: 'timestamp' })
  created: Date
}
