import { CoreEntity } from '@global/global.entity';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { IsString, IsNumber, Length } from 'class-validator';
import { Restaurant } from './restaurant.entity';

@InputType('DishInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Dish extends CoreEntity {
  @Field(() => String)
  @Column()
  @IsString()
  name: string;

  @Field(() => Number)
  @Column()
  @IsNumber()
  price: number;

  @Field(() => String)
  @Column()
  @IsString()
  coverImage: string;

  @Field(() => String, { defaultValue: '' })
  @Column({ default: '' })
  @IsString()
  @Length(5, 30)
  description: string;

  @Field(() => Restaurant)
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.menu, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  restaurant: Restaurant;

  @RelationId((dish: Dish) => dish.restaurant)
  restaurantId: number;

  @Field(() => [DishOption])
  @Column({ type: 'json' })
  option: DishOption[];
}

@InputType('DishOptionInputType', { isAbstract: true })
@ObjectType()
export class DishOption {
  @Field(() => String)
  name: string;

  @Field(() => [Choice])
  choice: Choice[];
}

@InputType('ChoiceInputType', { isAbstract: true })
@ObjectType()
class Choice {
  @Field(() => String)
  name: string;

  @Field(() => Number)
  extraPrice: number;
}
