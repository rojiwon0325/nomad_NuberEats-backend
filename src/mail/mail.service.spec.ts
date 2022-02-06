import { MailerService } from '@nestjs-modules/mailer';
import { Test } from '@nestjs/testing';
import { MailService } from './mail.service';

const mockMailerService = {
  sendMail: jest.fn(),
};

describe('MailService', () => {
  let service: MailService;
  let mailerService: MailerService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
      ],
    }).compile();
    service = module.get<MailService>(MailService);
    mailerService = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('send', () => {
    it('should send mail', async () => {
      const { tos, subject, templateName, context } = {
        tos: ['test@test.com'],
        subject: 'Email Verify',
        templateName: 'verify.ejs',
        context: { code: 'test' },
      };
      await service.send(tos, subject, templateName, context);
      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: expect.any(String),
        subject: expect.any(String),
        template: expect.any(String),
        context: { code: 'test' },
      });
    });
    it('should send mail without args context', async () => {
      const { tos, subject, templateName } = {
        tos: ['test@test.com'],
        subject: 'Email Verify',
        templateName: 'verify.ejs',
      };
      await service.send(tos, subject, templateName);
      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: expect.any(String),
        subject: expect.any(String),
        template: expect.any(String),
        context: {},
      });
    });
  });

  it('verify, should send verification mail', () => {
    const input = {
      to: 'test@test.com',
      code: 'test',
    };
    service.verify(input.to, input.code);
    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: input.to,
      subject: 'Email Verify',
      template: 'verify.ejs',
      context: { code: input.code },
    });
  });
});
