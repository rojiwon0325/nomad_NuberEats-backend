import { CoreOutput } from '@global/global.dto';
import {
  ArgsType,
  Field,
  InputType,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { User } from './entity/user.entity';
import { Verification } from './entity/verification.entity';

@InputType()
export class CreateAccountInput extends PickType(User, [
  'email',
  'password',
  'role',
]) {}

@InputType()
export class LoginInput extends PickType(User, ['email', 'password']) {}
@ObjectType()
export class LoginOutput extends CoreOutput {
  @Field(() => String, { nullable: true })
  token?: string;
}

@ArgsType()
export class UserProfileInput {
  @Field(() => Number)
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
export class EditProfileInput extends EditProfileInputType {}

@InputType()
class VerifyEmailInputType extends PickType(Verification, ['code']) {}

@ArgsType()
export class VerifyEmailInput extends VerifyEmailInputType {}
