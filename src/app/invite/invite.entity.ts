import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm'

@Entity()
export class TInvite {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  lavel: number

  @Column()
  openid: string

  @Column()
  parent: string

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date

  @CreateDateColumn({ type: 'timestamp' })
  updated_at: Date
}
