import { CoreOutput } from '@global/dto/global.dto';
import {
  ArgsType,
  Field,
  InputType,
  ObjectType,
  PickType,
} from '@nestjs/graphql';
import { Dish, DishOption } from '@restaurant/entity/dish.entity';

@InputType()
class CreateDishInputType extends PickType(Dish, [
  'name',
  'coverImage',
  'price',
]) {
  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => [DishOption], { defaultValue: [] })
  option: DishOption[];
}

@ArgsType()
export class CreateDishInput {
  @Field(() => Number)
  restaurantId: number;

  @Field(() => CreateDishInputType)
  data: CreateDishInputType;
}

@ObjectType()
export class CreateDishOutput extends CoreOutput {
  @Field(() => Dish, { nullable: true })
  result?: Dish;
}
