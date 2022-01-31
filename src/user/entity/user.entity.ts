import {
  Field,
  InputType,
  ObjectType,
  PickType,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreEntity } from '@global/global.entity';
import { Column, Entity } from 'typeorm';
import { IsString, IsEnum, IsEmail } from 'class-validator';
import { MutationOutput } from '@global/global.dto';

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

  @Column()
  @IsString()
  @Field(() => String)
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  @IsEnum(UserRole)
  @Field(() => UserRole)
  role: UserRole;
}

@InputType()
export class LoginInput extends PickType(User, ['email', 'password']) {}
@ObjectType()
export class LoginOutput extends MutationOutput {
  @Field(() => String, { nullable: true })
  token?: string;
}
