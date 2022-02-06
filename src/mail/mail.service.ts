import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async send(
    tos: string[],
    subject: string,
    templateName: string,
    context: any = {},
  ) {
    await this.mailerService.sendMail({
      to: tos.join(', '),
      subject,
      template: `${templateName}`,
      context,
    });
  }

  verify(to: string, code: string) {
    this.send([to], 'Email Verify', 'verify.ejs', { code });
  }
}
