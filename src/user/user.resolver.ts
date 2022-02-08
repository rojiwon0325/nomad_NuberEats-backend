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
  async login(@Args('user') loginInput: LoginInput): Promise<LoginOutput> {
    return this.userService.login(loginInput);
  }

  @Role(['Any'])
  @Query(() => User, { nullable: true })
  me(@AuthUser() authUser: User): User | undefined {
    return authUser;
  }

  @Role(['Any'])
  @Query(() => UserProfileOutput)
  async userProfile(
    @Args() userProfileInput: UserProfileInput,
  ): Promise<UserProfileOutput> {
    return this.userService.findById(userProfileInput.id);
  }

  @Role(['Any'])
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
