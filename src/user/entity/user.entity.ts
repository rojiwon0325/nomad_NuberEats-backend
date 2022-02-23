import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreEntity } from '@global/global.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import {
  IsString,
  IsEnum,
  IsEmail,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Restaurant } from '@restaurant/entity/restaurant.entity';
import { Order } from 'src/order/entity/order.entity';

export enum UserRole {
  Client = 'client',
  Owner = 'owner',
  Rider = 'rider',
  Admin = 'admin',
}

registerEnumType(UserRole, { name: 'UserRole' });

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Field(() => String)
  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Field(() => String)
  @Column({ unique: true })
  @IsString()
  username: string;

  @Field(() => String)
  @Column({ select: false })
  @IsString()
  password: string;

  @Field(() => UserRole)
  @Column({ type: 'enum', enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;

  @Field(() => Boolean)
  @Column({ default: false })
  @IsBoolean()
  verified: boolean;

  @Field(() => [Restaurant], { nullable: true })
  @OneToMany(() => Restaurant, (restaurant) => restaurant.owner)
  @ValidateNested({ each: true })
  @Type(() => Restaurant)
  restaurant?: Restaurant[];

  @Field(() => [Order], { nullable: true })
  @OneToMany(() => Order, (order) => order.customer)
  @ValidateNested({ each: true })
  @Type(() => Order)
  order: Order[];

  @Field(() => [Order], { nullable: true })
  @OneToMany(() => Order, (order) => order.rider)
  @ValidateNested({ each: true })
  @Type(() => Order)
  rider: Order[];
}
