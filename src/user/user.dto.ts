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
import { Verification } from './entity/verification.entity';

@InputType()
export class CreateAccountInput extends PickType(User, [
  'email',
  'username',
  'password',
  'role',
]) {}

@InputType()
export class LoginInput extends PickType(User, ['email', 'password']) {}
@ObjectType()
export class LoginOutput extends CoreOutput {}

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
class EditProfileInputType extends PickType(PartialType(User), [
  'email',
  'username',
]) {}

// PartialType이 감싼 형태 x
// PickType에 PartialType 인자로 넣기 o

@ArgsType()
export class EditProfileInput {
  @Field(() => String, { nullable: true })
  email?: string;
  @Field(() => String, { nullable: true })
  username?: string;
}

@InputType()
class VerifyEmailInputType extends PickType(Verification, ['code']) {}

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
