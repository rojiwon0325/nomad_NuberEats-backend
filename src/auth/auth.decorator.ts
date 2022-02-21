import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '@user/entity/user.entity';

export const AuthUser = createParamDecorator<
  unknown,
  ExecutionContext,
  User | undefined
>((data, context) => {
  const gqlContext = GqlExecutionContext.create(context).getContext();
  const user: User = gqlContext['user'];
  if (gqlContext['isMe']) {
    return user;
  }
  return undefined;
});
