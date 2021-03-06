import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CoreOutput } from '@global/dto/global.dto';
import {
  LoginInput,
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

  @Mutation(() => CoreOutput)
  login(
    @Args('user') loginInput: LoginInput,
    @Context() ctx: any,
  ): Promise<CoreOutput> {
    return this.userService.login(loginInput, ctx.res);
  }

  @Query(() => Boolean)
  logout(@Context() ctx: any): boolean {
    ctx.res.cookie('access_token', '', { httpOnly: true, expires: new Date() });
    return true;
  }

  @Query(() => Boolean)
  isLogin(@Context() ctx: any): boolean | Promise<boolean> {
    const token = ctx['req'].cookies['access_token'];
    if (token === undefined) {
      return false;
    }
    return this.userService.isExist(token);
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
    @Args('data') edit: EditProfileInput,
  ): Promise<CoreOutput> {
    return this.userService.editProfile(authUser.id, edit);
  }

  @Mutation(() => VerifyEmailOutput)
  verifyEmail(@Args() { code }: VerifyEmailInput): Promise<VerifyEmailOutput> {
    return this.userService.verifyEmail(code);
  }
}
