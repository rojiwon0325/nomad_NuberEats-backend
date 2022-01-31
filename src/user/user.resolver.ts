import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MutationOutput } from '@global/global.dto';
import { CreateAccountInput } from './user.dto';
import { UserService } from './user.service';
import { LoginInput, LoginOutput, User } from './entity/user.entity';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthUser } from 'src/auth/auth.decorator';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => Boolean)
  test() {
    return true;
  }

  @Mutation(() => MutationOutput)
  createAccount(
    @Args('user') createAccountInput: CreateAccountInput,
  ): Promise<MutationOutput> {
    return this.userService.createAccount(createAccountInput);
  }

  @Mutation(() => LoginOutput)
  async login(@Args('login') loginInput: LoginInput): Promise<LoginOutput> {
    return this.userService.login(loginInput);
  }

  @Query(() => User, { nullable: true })
  @UseGuards(AuthGuard)
  me(@AuthUser() authUser: User): User | undefined {
    return authUser;
  }
}
