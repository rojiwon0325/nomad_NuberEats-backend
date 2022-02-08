import {
  ArgsType,
  Field,
  InputType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { Category } from './entity/category.entity';
import { Restaurant } from './entity/restaurant.entity';

@InputType()
export class CreateRestaurantInput extends PickType(Restaurant, [
  'address',
  'coverImage',
  'name',
]) {
  @Field(() => String, { nullable: true })
  category?: string;
}

@InputType()
export class CreateCategoryInput extends PickType(Category, [
  'name',
  'coverImage',
]) {}

@InputType()
class EditRestaurantInputType extends PartialType(CreateRestaurantInput) {}

@ArgsType()
export class EditRestaurantInput {
  @Field(() => Number)
  restaurantId: number;

  @Field(() => EditRestaurantInputType)
  data: EditRestaurantInputType;
}
