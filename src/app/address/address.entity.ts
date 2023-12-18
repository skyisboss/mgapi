import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm'

@Entity()
export class TAddress {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  openid: string

  @Column()
  eth_address: string

  @Column()
  tron_address: string

  @Column()
  bsc_address: string

  @Column({ default: 1 })
  version: number

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date

  @CreateDateColumn({ type: 'timestamp' })
  updated_at: Date
}
