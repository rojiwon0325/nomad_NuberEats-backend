import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './user.dto';
import { LoginInput, LoginOutput, User } from './entity/user.entity';
import { MutationOutput } from '@global/global.dto';
import { JwtService } from '@jwt/jwt.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}
  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<MutationOutput> {
    try {
      const exist = await this.userRepository.findOne({ email });
      if (exist) {
        return { error: '이미 존재하는 이메일입니다.', ok: false };
      }
      await this.userRepository.save(
        this.userRepository.create({ email, password, role }),
      );
      return { ok: true };
    } catch {
      return { error: '계정을 생성하지 못했습니다.', ok: false };
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const user = await this.userRepository.findOne({ email });
      if (!user) {
        return { ok: false, error: '계정이 존재하지 않습니다.' };
      } else if (user.password !== password) {
        return { ok: false, error: '계정 정보가 일치하지 않습니다.' };
      } else {
        const token = this.jwtService.sign(user.id);
        return { ok: true, token };
      }
    } catch {
      return { ok: false, error: '로그인에 실패하였습니다.' };
    }
  }
}
