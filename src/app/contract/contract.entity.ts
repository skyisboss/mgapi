import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm'

@Entity()
export class TContract {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  owner: string

  @Column()
  partner: string

  @Column()
  link: string

  @Column()
  token: string

  @Column({ type: 'decimal', precision: 32, scale: 0, default: 0 })
  amount: number

  @Column({ type: 'decimal', precision: 32, scale: 0, default: 0 })
  deposit: number

  @Column({ type: 'double', precision: 2, scale: 1 })
  percent: number

  @Column()
  content: string

  @Column({ default: 1 })
  version: number

  @Column({ default: 0 })
  status: number

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date

  @CreateDateColumn({ type: 'timestamp' })
  updated_at: Date
}
