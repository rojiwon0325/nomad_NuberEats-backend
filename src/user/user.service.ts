import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './user.dto';
import { LoginInput, LoginOutput, User } from './entity/user.entity';
import { MutationOutput } from '@common/common.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}
  async createAccount({
    email,
    role,
  }: CreateAccountInput): Promise<MutationOutput> {
    try {
      const exist = await this.userRepository.findOne({ email });
      if (exist) {
        return { error: '이미 존재하는 이메일입니다.', ok: false };
      }
      await this.userRepository.save(
        this.userRepository.create({ email, role }),
      );
      return { ok: true };
    } catch {
      return { error: '계정을 생성하지 못했습니다.', ok: false };
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const user = await this.userRepository.findOne(email);
      if (user && user.password === password) {
        return { ok: true, token: '' };
      } else {
        return { ok: false, error: '계정정보가 다릅니다.' };
      }
    } catch {
      return { ok: false, error: '로그인에 실패하였습니다.' };
    }
  }
}
