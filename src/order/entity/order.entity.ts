import { CoreEntity } from '@global/global.entity';
import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { Restaurant } from '@restaurant/entity/restaurant.entity';
import { User } from '@user/entity/user.entity';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { IsEnum, IsNumber } from 'class-validator';
import { OrderedDish } from './orderedDish.entity';

export enum OrderStatus {
  Pending = 'pending',
  Cooking = 'cooking',
  Waiting = 'waiting',
  Delivering = 'delivering',
  Canceled = 'canceled',
  Delivered = 'delivered',
  PickedUp = 'pickedup',
}

registerEnumType(OrderStatus, { name: 'OrdderStatus' });

@InputType('OrderInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity {
  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.order, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  customer?: User;

  @RelationId((order: Order) => order.customer)
  customerId: number;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.rider, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  rider?: User;

  @RelationId((order: Order) => order.rider)
  riderId: number;

  @Field(() => Restaurant, { nullable: true })
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.order, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  restaurant?: Restaurant;

  @Field(() => [OrderedDish])
  @OneToMany(() => OrderedDish, (orderedDish) => orderedDish.order)
  orderedDish: OrderedDish[];

  @Field(() => Number)
  @Column()
  @IsNumber()
  totalPrice: number;

  @Field(() => OrderStatus)
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.Pending })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
