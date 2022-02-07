import { Injectable, NestMiddleware } from '@nestjs/common';
import { UserService } from '@user/user.service';
import { NextFunction, Request, Response } from 'express';
import { JwtService } from './jwt.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers['access_token'];
      const decoded = this.jwtService.verify(token.toString());
      const { user } = await this.userService.findById(decoded['id']);
      req['user'] = user;
    } catch {
      // access_token isn't
    }
    next();
  }
}
