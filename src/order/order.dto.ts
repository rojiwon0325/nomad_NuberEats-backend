import { ArgsType, Field, InputType, Int } from '@nestjs/graphql';
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
}
