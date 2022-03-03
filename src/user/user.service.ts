import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  EditProfileInput,
  LoginInput,
  LoginOutput,
  UserProfileOutput,
  VerifyEmailOutput,
} from './user.dto';
import { User } from './entity/user.entity';
import { Verification } from './entity/verification.entity';
import { CoreOutput } from '@global/dto/global.dto';
import { JwtService } from '@jwt/jwt.service';
import { MailService } from '@mail/mail.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Verification)
    private readonly verification: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}
  async createAccount({
    email,
    username,
    password,
    role,
  }: CreateAccountInput): Promise<CoreOutput> {
    try {
      const exist = await this.userRepository.findOne({ email });
      if (exist) {
        return { ok: false, error: '이미 존재하는 이메일입니다.' };
      }
      const user = await this.userRepository.save(
        this.userRepository.create({ email, username, password, role }),
      );
      const { error } = await this.sendVerification(user);
      return { ok: true, error };
    } catch {
      return { ok: false, error: '계정을 생성하지 못했습니다.' };
    }
  }

  async sendVerification(user: User): Promise<CoreOutput> {
    try {
      await this.verification.delete({ user });
      const { code } = await this.verification.save(
        this.verification.create({ user }),
      );
      this.mailService.verify(user.email, code);
      return { ok: true };
    } catch {
      return {
        ok: false,
        error: '인증메일 전송에 실패하였습니다.',
      };
    }
  }

  async login({ email, password }: LoginInput, res: any): Promise<LoginOutput> {
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
        res.cookie('access_token', token, { httpOnly: true });
        res.cookie('isLogin', 'yes');
        return { ok: true };
      }
    } catch {
      return { ok: false, error: '로그인에 실패하였습니다.' };
    }
  }

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.userRepository.findOneOrFail({ id });
      return { ok: true, user };
    } catch {
      return { ok: false, error: '사용자를 찾지 못했습니다.' };
    }
  }

  async editProfile(id: number, edit: EditProfileInput): Promise<CoreOutput> {
    //this.userRepository.update({ id }, edit);
    //update는 db에 곧바로 query문을 전달하는 형태 entity점검 x
    //따라서 BeforeUpdate등을 실행하지 않음
    //entity를 사용하려면 수정된 user를 통째로
    //save함수에 넣어서 실행해야 함, ex) save(updatedUser);
    try {
      const user = await this.userRepository.findOneOrFail({ id });
      if (edit.email) {
        const existed = await this.userRepository.findOne({
          email: edit.email,
        });
        if (existed) {
          return { ok: false, error: '이미 사용중인 이메일입니다.' };
        }
        await this.verification.delete({ user });
        user.email = edit.email;
        user.verified = false;
        await this.sendVerification(user);
      }
      if (edit.username) {
        user.username = edit.username;
      }
      await this.userRepository.save(user);
      return { ok: true };
    } catch {
      return { ok: false, error: '변경사항이 적용되지 않았습니다.' };
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const verify = await this.verification.findOneOrFail(
        { code },
        { relations: ['user'] },
      );
      verify.user.verified = true;
      await this.userRepository.save(verify.user);
      await this.verification.delete(verify.id);
      return { ok: true, userId: verify.user.id };
    } catch {
      return { ok: false, error: '인증에 실패하였습니다.' };
    }
  }
}
