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
import { User } from './entity/user.entity';

@InputType()
export class CreateAccountInput extends PickType(User, [
  'email',
  'username',
  'role',
]) {
  @Field(() => String)
  password: string;
}

@InputType()
export class LoginInput extends PickType(User, ['email']) {
  @Field(() => String)
  password: string;
}

@ArgsType()
export class UserProfileInput {
  @Field(() => Int)
  id: number;
}

@ObjectType()
export class UserProfileOutput extends CoreOutput {
  @Field(() => User, { nullable: true })
  user?: User;
}

@InputType()
export class EditProfileInput extends PickType(PartialType(User), [
  'email',
  'username',
]) {}

// PartialType이 감싼 형태 x
// PickType에 PartialType 인자로 넣기 o

@ArgsType()
export class VerifyEmailInput {
  @Field(() => String, { nullable: true })
  code?: string;
}

@ObjectType()
export class VerifyEmailOutput extends CoreOutput {
  @Field(() => Int, { nullable: true })
  userId?: number;
}
