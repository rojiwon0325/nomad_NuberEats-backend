import { CoreOutput } from '@global/dto/global.dto';
import {
  ArgsType,
  Field,
  InputType,
  Int,
  ObjectType,
  PickType,
} from '@nestjs/graphql';
import { Category } from '@restaurant/entity/category.entity';

@InputType()
export class CreateCategoryInput extends PickType(Category, [
  'name',
  'coverImage',
]) {}

@ObjectType()
export class AllCategoryOutput extends CoreOutput {
  @Field(() => [Category], { nullable: true })
  result?: Category[];
}

@ObjectType()
export class CategoryOutput extends CoreOutput {
  @Field(() => Category, { nullable: true })
  category?: Category;
}

@ArgsType()
export class UpdateCategoryImageInput {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  coverImage: string;
}
