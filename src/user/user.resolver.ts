import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CommonOutput } from '@common/common.dto';
import { CreateAccountInput } from './user.dto';
import { UserService } from './user.service';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => Boolean)
  test() {
    return true;
  }

  @Mutation(() => CommonOutput)
  createAccount(
    @Args('user') createAccountInput: CreateAccountInput,
  ): Promise<CommonOutput> {
    return this.userService.createAccount(createAccountInput);
  }
}
