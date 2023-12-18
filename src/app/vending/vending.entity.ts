import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm'

@Entity()
export class TVending {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  openid: string

  @Column()
  name: string

  @Column()
  link: string

  @Column()
  payment: string

  @Column()
  describe: string

  @Column({ default: 1 })
  status: number

  @Column()
  goods_count: number

  @Column()
  sales_count: number

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date

  @CreateDateColumn({ type: 'timestamp' })
  updated_at: Date
}
