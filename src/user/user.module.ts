import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Verification } from './entity/verification.entity';
import { MailModule } from '@mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Verification]), MailModule],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
