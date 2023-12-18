import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm'

@Entity()
export class THongbao {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  openid: string

  @Column()
  type: number

  @Column()
  token: string

  @Column({ type: 'decimal', precision: 32, scale: 0, default: 0 })
  amount: number

  @Column({ default: '[]' })
  available_balance: string

  @Column({ default: 1 })
  available_claim: number

  @Column()
  touser: string

  @Column()
  link: string

  @Column({ default: 1 })
  version: number

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date

  @CreateDateColumn({ type: 'timestamp' })
  updated_at: Date
}
