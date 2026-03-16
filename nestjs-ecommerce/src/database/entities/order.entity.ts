import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ProductVariation } from './productVariation.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  public id!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  public user: User;

  @Column({ type: 'int' })
  public userId: number;

  @ManyToOne(() => ProductVariation)
  @JoinColumn({ name: 'productVariationId' })
  public productVariation: ProductVariation;

  @Column({ type: 'int' })
  public productVariationId: number;

  @Column({ type: 'int' })
  public quantity: number;

  @Column({ type: 'varchar', length: 7 })
  public countryCode: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  public status: OrderStatus;

  @CreateDateColumn({ type: 'timestamp' })
  public createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  public updatedAt!: Date;
}
