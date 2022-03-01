import { JwtService } from '@jwt/jwt.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserService } from '@user/user.service';
import { AllowedRoles } from './role.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const roles = this.reflector.get<AllowedRoles>(
        'roles',
        context.getHandler(),
      );
      if (!roles) {
        return true;
      }
      const gqlContext = GqlExecutionContext.create(context).getContext();
      const decoded = this.jwtService.verify(gqlContext['token']);
      if (
        typeof decoded !== 'object' ||
        !decoded.hasOwnProperty('id') ||
        !decoded.hasOwnProperty('ip')
      ) {
        return false;
      }
      const userIp: string = gqlContext['userIp'];
      const { user } = await this.userService.findById(decoded['id']);
      const isMe = decoded['ip'] === userIp;
      if (!user) {
        return false;
      }
      gqlContext['user'] = user;
      return isMe && (roles.includes('Any') || roles.includes(user.role));
    } catch {
      return false;
    }
  }
}
