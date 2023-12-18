import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm'

@Entity()
export class TDeposit {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  openid: string

  @Column()
  token: string

  @Column()
  from_address: string

  @Column()
  to_address: string

  @Column({ type: 'decimal', precision: 32, scale: 0, default: 0 })
  amount: number

  @Column()
  status: number

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date

  @CreateDateColumn({ type: 'timestamp' })
  updated_at: Date
}
