import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm'

@Entity()
export class TClaims {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  openid: string

  @Column()
  link: string

  @Column()
  type: number

  @Column({ type: 'decimal', precision: 32, scale: 0, default: 0 })
  amount: number

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date

  @CreateDateColumn({ type: 'timestamp' })
  updated_at: Date
}
