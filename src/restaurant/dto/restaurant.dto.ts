import { CoreOutput } from '@global/dto/global.dto';
import { PaginationInput, PaginationOutput } from '@global/dto/pagination.dto';
import {
  ArgsType,
  Field,
  InputType,
  Int,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { Restaurant } from '../entity/restaurant.entity';

@InputType()
export class CreateRestaurantInput extends PickType(Restaurant, [
  'address',
  'coverImage',
  'name',
]) {
  @Field(() => String, { nullable: true })
  category?: string;
}

@ObjectType()
export class CreateRestaurantOutput extends CoreOutput {
  @Field(() => Restaurant, { nullable: true })
  result?: Restaurant;
}

@InputType()
class EditRestaurantInputType extends PartialType(CreateRestaurantInput) {}

@ArgsType()
export class EditRestaurantInput {
  @Field(() => Int)
  restaurantId: number;

  @Field(() => EditRestaurantInputType)
  data: EditRestaurantInputType;
}

@ArgsType()
export class ByNameInput {
  @Field(() => String)
  name: string;
}

@ArgsType()
export class ByIdInput {
  @Field(() => Int)
  id: number;
}

@ArgsType()
export class NamePageInput extends PaginationInput {
  @Field(() => String)
  name: string;
}

@ObjectType()
export class RestaurantsOutput extends PaginationOutput {
  @Field(() => [Restaurant], { nullable: true })
  result?: Restaurant[];
}

@ObjectType()
export class RestaurantOutput extends CoreOutput {
  @Field(() => Restaurant, { nullable: true })
  result?: Restaurant;
}

@ArgsType()
export class SearchRestaurantInput extends PaginationInput {
  @Field(() => String)
  key: string;
}
