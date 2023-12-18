import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm'

@Entity()
export class TGoods {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  openid: string

  @Column()
  token: string

  @Column()
  title: string

  @Column({ type: 'decimal', precision: 32, scale: 0, default: 0 })
  price: number

  @Column()
  describe: string

  @Column()
  content: string

  @Column()
  views: number

  @Column()
  sales: number

  @Column({ default: 1 })
  status: number

  @Column({ default: 0 })
  version: number

  @Column({ default: '[]' })
  logs: string

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date

  @CreateDateColumn({ type: 'timestamp' })
  updated_at: Date

  @CreateDateColumn({ type: 'timestamp' })
  deleted_at: Date
}
