import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm'

@Entity()
export class TMerchantLog {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  openid: string

  /** 1-收入 2-提款 */
  @Column()
  type: number

  @Column()
  from: string

  @Column()
  token: string

  @Column({ type: 'decimal', precision: 32, scale: 0, default: 0 })
  amount: number

  @Column({ type: 'decimal', precision: 32, scale: 0, default: 0 })
  fee_amount: number

  @Column({ type: 'decimal', precision: 32, scale: 0, default: 0 })
  actual_amount: number

  @Column()
  status: number

  @Column({ default: 1 })
  version: number

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date

  @CreateDateColumn({ type: 'timestamp' })
  updated_at: Date
}
