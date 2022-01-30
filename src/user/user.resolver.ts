import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MutationOutput } from '@common/common.dto';
import { CreateAccountInput } from './user.dto';
import { UserService } from './user.service';
import { LoginInput, LoginOutput } from './entity/user.entity';

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
}
