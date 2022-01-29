import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './user.dto';
import { User } from './entity/user.entity';
import { CommonOutput } from '@common/common.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}
  async createAccount({
    email,
    role,
  }: CreateAccountInput): Promise<CommonOutput> {
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
}
