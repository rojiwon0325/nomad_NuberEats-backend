import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CoreOutput } from '@global/global.dto';
import {
  LoginInput,
  LoginOutput,
  EditProfileInput,
  UserProfileInput,
  UserProfileOutput,
  CreateAccountInput,
  VerifyEmailInput,
} from './user.dto';
import { UserService } from './user.service';
import { User } from './entity/user.entity';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@auth/auth.guard';
import { AuthUser } from '@auth/auth.decorator';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => Boolean)
  test() {
    return true;
  }

  @Mutation(() => CoreOutput)
  createAccount(
    @Args('user') createAccountInput: CreateAccountInput,
  ): Promise<CoreOutput> {
    return this.userService.createAccount(createAccountInput);
  }

  @Mutation(() => LoginOutput)
  async login(@Args('login') loginInput: LoginInput): Promise<LoginOutput> {
    return this.userService.login(loginInput);
  }

  @UseGuards(AuthGuard)
  @Query(() => User, { nullable: true })
  me(@AuthUser() authUser: User): User | undefined {
    return authUser;
  }

  @UseGuards(AuthGuard)
  @Query(() => UserProfileOutput)
  async userProfile(
    @Args() userProfileInput: UserProfileInput,
  ): Promise<UserProfileOutput> {
    return this.userService.findById(userProfileInput.id);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => CoreOutput)
  async editProfile(
    @AuthUser() authUser: User,
    @Args() edit: EditProfileInput,
  ): Promise<CoreOutput> {
    return this.userService.editProfile(authUser.id, edit);
  }

  @Mutation(() => CoreOutput)
  async verifyEmail(@Args() { code }: VerifyEmailInput): Promise<CoreOutput> {
    return this.userService.verifyEmail(code);
  }
}
