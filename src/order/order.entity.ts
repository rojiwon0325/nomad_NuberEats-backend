import { CoreEntity } from '@global/global.entity';
import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { Dish } from '@restaurant/entity/dish.entity';
import { Restaurant } from '@restaurant/entity/restaurant.entity';
import { User } from '@user/entity/user.entity';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';

export enum OrderStatus {
  Pending = 'pending',
  Cooking = 'cooking',
  PickUp = 'pickUp',
  Delivered = 'delivered',
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

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.rider, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  rider?: User;

  @Field(() => Restaurant, { nullable: true })
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.order, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  restaurant?: Restaurant;

  @Field(() => [Dish])
  @ManyToMany(() => Dish)
  @JoinTable()
  dish: Dish[];

  @Field(() => Number)
  totalPrice: number;

  @Field(() => OrderStatus)
  @Column({ type: 'enum', enum: OrderStatus })
  status: OrderStatus;
}
