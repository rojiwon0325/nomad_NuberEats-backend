import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreEntity } from '@global/global.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { IsString, IsEnum, IsEmail, IsBoolean } from 'class-validator';
import { Restaurant } from '@restaurant/entity/restaurant.entity';
export enum UserRole {
  Client = 'client',
  Owner = 'owner',
  Delivery = 'delivery',
  Admin = 'admin',
}

registerEnumType(UserRole, { name: 'UserRole' });

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Column({ unique: true })
  @IsEmail()
  @Field(() => String)
  email: string;

  @Column({ unique: true })
  @IsString()
  @Field(() => String)
  username: string;

  @Column({ select: false })
  @IsString()
  @Field(() => String)
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  @IsEnum(UserRole)
  @Field(() => UserRole)
  role: UserRole;

  @Column({ default: false })
  @IsBoolean()
  @Field(() => Boolean)
  verified: boolean;

  @Field(() => [Restaurant])
  @OneToMany(() => Restaurant, (restaurant) => restaurant.owner)
  restaurants: Restaurant[];
}
