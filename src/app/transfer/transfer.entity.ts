import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm'

@Entity()
export class TTransfer {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  from_user: string

  @Column()
  to_user: string

  @Column()
  token: string

  @Column({ type: 'decimal', precision: 32, scale: 0, default: 0 })
  amount: number

  @Column({ type: 'tinyint', default: 0 })
  status: number

  @Column({ default: 1 })
  version: number

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date

  @CreateDateColumn({ type: 'timestamp' })
  updated_at: Date
}
