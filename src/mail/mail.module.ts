import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';

@Module({
  imports: [],
  providers: [MailService],
  exports: [MailService],
})
@Global()
export class MailModule {}
