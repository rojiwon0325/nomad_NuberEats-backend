import { CoreOutput } from '@global/dto/global.dto';
import {
  ArgsType,
  Field,
  InputType,
  Int,
  ObjectType,
  PartialType,
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
  @Field(() => Int)
  restaurantId: number;

  @Field(() => CreateDishInputType)
  data: CreateDishInputType;
}

@ObjectType()
export class CreateDishOutput extends CoreOutput {
  @Field(() => Dish, { nullable: true })
  result?: Dish;
}

@InputType()
class EditDishInputType extends PickType(PartialType(Dish), [
  'name',
  'coverImage',
  'price',
  'option',
  'description',
]) {}

@ArgsType()
export class EditDishInput {
  @Field(() => Int)
  dishId: number;

  @Field(() => EditDishInputType)
  data: EditDishInputType;
}

@ObjectType()
export class EditDishOutput extends CoreOutput {
  @Field(() => Dish, { nullable: true })
  result?: Dish;
}

@ArgsType()
export class DeleteDishInput {
  @Field(() => Int)
  dishId: number;
}
