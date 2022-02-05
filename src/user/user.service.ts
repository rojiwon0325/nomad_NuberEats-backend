import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  EditProfileInput,
  LoginInput,
  LoginOutput,
  UserProfileOutput,
} from './user.dto';
import { User } from './entity/user.entity';
import { Verification } from './entity/verification.entity';
import { CoreOutput } from '@global/global.dto';
import { JwtService } from '@jwt/jwt.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Verification)
    private readonly verification: Repository<Verification>,
    private readonly jwtService: JwtService,
  ) {}
  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CoreOutput> {
    try {
      const exist = await this.userRepository.findOne({ email });
      if (exist) {
        return { error: '이미 존재하는 이메일입니다.', ok: false };
      }
      const user = await this.userRepository.save(
        this.userRepository.create({ email, password, role }),
      );
      await this.verification.save(this.verification.create({ user }));
      return { ok: true };
    } catch {
      return { error: '계정을 생성하지 못했습니다.', ok: false };
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const user = await this.userRepository.findOne(
        { email },
        { select: ['password', 'id'] },
      );
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

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.userRepository.findOne(id);
      if (user) {
        return { ok: true, user };
      } else {
        return { ok: false, error: '존재하지 않는 사용자입니다.' };
      }
    } catch (e) {
      return { ok: false, error: '정보를 불러오지 못했습니다.' };
    }
  }

  async editProfile(id: number, edit: EditProfileInput): Promise<CoreOutput> {
    //this.userRepository.update({ id }, edit);
    //update는 db에 곧바로 query문을 전달하는 형태 entity점검 x
    //따라서 BeforeUpdate등을 실행하지 않음
    //entity를 사용하려면 수정된 user를 통째로
    //save함수에 넣어서 실행해야 함, ex) save(updatedUser);
    try {
      const user = await this.userRepository.findOne(id);
      if (edit.username) {
        user.username = edit.username;
      }
      if (edit.email) {
        user.email = edit.email;
        user.verified = false;
        await this.verification.save(this.verification.create({ user }));
      }
      return { ok: true };
    } catch (e) {}
    return { ok: false, error: '변경사항이 적용되지 않았습니다.' };
  }

  async verifyEmail(code: string): Promise<CoreOutput> {
    try {
      const verify = await this.verification.findOne(
        { code },
        { relations: ['user'] },
      );
      if (verify) {
        verify.user.verified = true;
        await this.userRepository.save(verify.user);
        await this.verification.delete(verify.id);
        return { ok: true };
      }
      return { ok: false, error: '인증정보를 불러오지 못했습니다.' };
    } catch (error) {
      return { ok: false, error: '인증에 실패하였습니다.' };
    }
  }
}
