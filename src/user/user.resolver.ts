import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CoreOutput } from '@global/dto/global.dto';
import {
  LoginInput,
  LoginOutput,
  EditProfileInput,
  UserProfileInput,
  UserProfileOutput,
  CreateAccountInput,
  VerifyEmailInput,
  VerifyEmailOutput,
} from './user.dto';
import { UserService } from './user.service';
import { User } from './entity/user.entity';
import { AuthUser } from '@auth/auth.decorator';
import { Role } from '@auth/role.decorator';
@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => CoreOutput)
  createAccount(
    @Args('user') createAccountInput: CreateAccountInput,
  ): Promise<CoreOutput> {
    return this.userService.createAccount(createAccountInput);
  }

  @Mutation(() => LoginOutput)
  async login(
    @Args('user') loginInput: LoginInput,
    @Context() ctx: any,
  ): Promise<LoginOutput> {
    const result = await this.userService.login(loginInput);
    if ('token' in result) {
      ctx.res.cookie('access_token', result.token, { httpOnly: true });
      return { ok: true };
    } else {
      return result;
    }
  }

  @Role(['Any'])
  @Query(() => User, { nullable: true })
  me(@AuthUser() authUser: User): User | undefined {
    return authUser;
  }

  @Role(['Any'])
  @Query(() => UserProfileOutput)
  userProfile(
    @Args() userProfileInput: UserProfileInput,
  ): Promise<UserProfileOutput> {
    return this.userService.findById(userProfileInput.id);
  }

  @Role(['Any'])
  @Mutation(() => CoreOutput)
  editProfile(
    @AuthUser() authUser: User,
    @Args() edit: EditProfileInput,
  ): Promise<CoreOutput> {
    return this.userService.editProfile(authUser.id, edit);
  }

  @Mutation(() => VerifyEmailOutput)
  verifyEmail(@Args() { code }: VerifyEmailInput): Promise<VerifyEmailOutput> {
    return this.userService.verifyEmail(code);
  }
}
