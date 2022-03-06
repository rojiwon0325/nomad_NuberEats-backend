import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { IsString, Length, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CoreEntity } from '@global/global.entity';
import { User } from '@user/entity/user.entity';
import { Category } from './category.entity';
import { Dish } from './dish.entity';
import { Order } from 'src/order/entity/order.entity';

@InputType('RestaurantInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant extends CoreEntity {
  @Field(() => String)
  @Column({ unique: true })
  @IsString()
  @Length(5)
  name: string;

  @Field(() => String)
  @Column()
  @IsString()
  coverImage: string;

  @Field(() => String)
  @Column()
  @IsString()
  address: string;

  @Field(() => Category, { nullable: true })
  @ManyToOne(() => Category, (category) => category.restaurant, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: true,
  })
  @ValidateNested()
  @Type(() => Category)
  category?: Category;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.restaurant, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @ValidateNested()
  @Type(() => User)
  owner: User;

  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: number;

  @Field(() => [Dish])
  @OneToMany(() => Dish, (dish) => dish.restaurant)
  menu: Dish[];

  @Field(() => [Order])
  @OneToMany(() => Order, (order) => order.restaurant)
  order: Order[];
}
