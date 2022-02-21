import { CoreEntity } from '@global/global.entity';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne } from 'typeorm';
import { IsString, IsNumber } from 'class-validator';
import { Order } from './order.entity';

@InputType('OrderedDishInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class OrderedDish extends CoreEntity {
  @Field(() => String)
  @Column()
  @IsString()
  name: string;

  @Field(() => Number)
  @Column()
  @IsNumber()
  price: number;

  @Field(() => [OrderOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  option?: OrderOption[];

  @Field(() => Order)
  @ManyToOne(() => Order, { nullable: false, onDelete: 'CASCADE' })
  order: Order;
}

@InputType('OrderOptionInputType', { isAbstract: true })
@ObjectType()
export class OrderOption {
  @Field(() => String)
  name: string;

  @Field(() => [String])
  choice: string[];
}
