import { CoreOutput } from '@global/dto/global.dto';
import { ArgsType, Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Order, OrderStatus } from './entity/order.entity';
import { OrderOption } from './entity/orderedDish.entity';

@InputType()
class CreateOrderedDishType {
  @Field(() => Int)
  dishId: number;

  @Field(() => [OrderOption], { defaultValue: [] })
  option: OrderOption[];
}

@ArgsType()
export class CreateOrderInput {
  @Field(() => Int)
  restaurantId: number;

  @Field(() => [CreateOrderedDishType])
  orderList: CreateOrderedDishType[];

  @Field(() => Boolean, { defaultValue: true })
  delivery: boolean;

  @Field(() => String)
  address: string;
}

@ArgsType()
export class FindManyOrderInput {
  @Field(() => OrderStatus, { nullable: true })
  status?: OrderStatus;
}

@ObjectType()
export class FindManyOrderOutput extends CoreOutput {
  @Field(() => [Order], { nullable: true })
  order?: Order[];
}

@ArgsType()
export class FindOrderByIdInput {
  @Field(() => Int)
  id: number;
}
@ObjectType()
export class FindOrderByIdOutput extends CoreOutput {
  @Field(() => Order, { nullable: true })
  order?: Order;
}

@ArgsType()
export class EditOrderInput {
  @Field(() => Int)
  id: number;

  @Field(() => OrderStatus)
  status: OrderStatus;
}

@ArgsType()
export class UpdateOrderInput {
  @Field(() => Int)
  id: number;
}

@ArgsType()
export class TakeOrderInput {
  @Field(() => Int)
  id: number;
}
