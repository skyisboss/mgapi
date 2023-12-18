import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm'

@Entity()
export class TBalance {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  uid: number

  @Column()
  openid: string

  @Column()
  account: string

  @Column({ type: 'decimal', precision: 32, scale: 0, default: 0 })
  trc20: number

  @Column({ type: 'decimal', precision: 32, scale: 0, default: 0 })
  erc20: number

  @Column({ type: 'decimal', precision: 32, scale: 0, default: 0 })
  bep20: number

  @Column({ type: 'decimal', precision: 32, scale: 0, default: 0 })
  eth: number

  @Column({ type: 'decimal', precision: 32, scale: 0, default: 0 })
  trx: number

  @Column({ type: 'decimal', precision: 32, scale: 0, default: 0 })
  bnb: number

  @Column({ default: 1 })
  version: number

  @CreateDateColumn({ type: 'timestamp' })
  created: Date
}
