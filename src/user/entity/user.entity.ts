import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreEntity } from '@global/global.entity';
import { Column, Entity } from 'typeorm';
import { IsString, IsEnum, IsEmail } from 'class-validator';

enum UserRole {
  Client = 'client',
  Owner = 'owner',
  Delivery = 'delivery',
  Admin = 'admin',
}

registerEnumType(UserRole, { name: 'UserRole' });

@InputType({ isAbstract: true })
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
  @Field(() => Boolean)
  verified: boolean;
}
