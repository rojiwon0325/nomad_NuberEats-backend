import { JwtService } from '@jwt/jwt.service';
import { MailService } from '@mail/mail.service';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entity/user.entity';
import { Verification } from './entity/verification.entity';
import { UserService } from './user.service';

const mockRepository = () => ({
  findOne: jest.fn(),
  findOneOrFail: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
});

const mockJwtService = {
  sign: jest.fn(() => 'signed-token'),
  verify: jest.fn(),
};

const mockMailService = {
  send: jest.fn(),
  verify: jest.fn(),
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UserService', () => {
  let service: UserService;
  let mailService: MailService;
  let jwtService: JwtService;
  let userRepository: MockRepository<User>;
  let verificationRepository: MockRepository<Verification>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: mockRepository() },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
        },
        { provide: JwtService, useValue: mockJwtService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();
    service = module.get<UserService>(UserService);
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get(getRepositoryToken(User));
    verificationRepository = module.get(getRepositoryToken(Verification));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    const createAccountArg = {
      email: 'test@test.com',
      username: 'testuser',
      password: '1234',
      role: UserRole.Client,
    };
    it('should fail if user exists', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 100,
        email: 'test@test.com',
      });
      const result = await service.createAccount(createAccountArg);
      expect(result).toMatchObject({
        error: '이미 존재하는 이메일입니다.',
        ok: false,
      });
    });
    it('should create a new user', async () => {
      userRepository.findOne.mockResolvedValue(undefined);
      userRepository.create.mockReturnValue(createAccountArg);
      userRepository.save.mockResolvedValue(createAccountArg);
      jest
        .spyOn(service, 'sendVerification')
        .mockImplementation(async () => ({ ok: true }));
      const result = await service.createAccount(createAccountArg);
      expect(userRepository.create).toHaveBeenCalledTimes(1);
      expect(userRepository.create).toHaveBeenCalledWith(createAccountArg);

      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith(createAccountArg);

      expect(result).toEqual({ ok: true });
    });
    it('should fail on exception', async () => {
      userRepository.findOne.mockRejectedValue(new Error());
      const result = await service.createAccount(createAccountArg);
      expect(result).toEqual({
        ok: false,
        error: '계정을 생성하지 못했습니다.',
      });
    });
  });

  describe('login', () => {
    const loginArgs = {
      email: 'test@test.com',
      password: 'test',
    };
    it('should fail if user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const result = await service.login(loginArgs);
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith(
        { email: loginArgs.email },
        { select: ['password', 'id'] },
      );
      expect(result).toEqual({ ok: false, error: '계정이 존재하지 않습니다.' });
    });
    it('should fail if the password is wrong', async () => {
      const mockedUser = { id: 1, password: '1234' };
      userRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(result).toEqual({
        ok: false,
        error: '계정 정보가 일치하지 않습니다.',
      });
    });
    it('should return token if password correct', async () => {
      const mockedUser = { id: 1, password: 'test' };
      userRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(mockedUser.id);
      expect(result).toEqual({ ok: true, token: 'signed-token' });
    });
    it('should fail on exception', async () => {
      userRepository.findOne.mockRejectedValue(new Error());
      const result = await service.login(loginArgs);
      expect(result).toEqual({ ok: false, error: '로그인에 실패하였습니다.' });
    });
  });

  describe('findById', () => {
    const id = 1;
    it('should find an existing user', async () => {
      userRepository.findOneOrFail.mockResolvedValue({ id });
      const result = await service.findById(id);
      expect(result).toEqual({ ok: true, user: { id } });
    });
    it('should fail if no user is found', async () => {
      userRepository.findOneOrFail.mockRejectedValue(new Error());
      const result = await service.findById(id);
      expect(result).toEqual({ ok: false, error: '사용자를 찾지 못했습니다.' });
    });
  });

  describe('editProfile', () => {
    const oldUser = {
      id: 100,
      email: 'test@test.com',
      username: 'testuser',
      verified: true,
    };
    beforeEach(() => {
      oldUser.id = 100;
      oldUser.email = 'test@test.com';
      oldUser.username = 'testuser';
      oldUser.verified = true;
    });
    it('should fail to change email if the email is existing', async () => {
      const args = {
        email: 'test@test.com',
      };
      userRepository.findOneOrFail.mockResolvedValue(oldUser);
      userRepository.findOne.mockResolvedValue(oldUser);
      const result = await service.editProfile(oldUser.id, args);
      expect(result).toEqual({
        ok: false,
        error: '이미 사용중인 이메일입니다.',
      });
      expect(userRepository.save).toHaveBeenCalledTimes(0);
    });
    it('should change email although sendVerification fail', async () => {
      const args = {
        email: 'new@test.com',
      };
      userRepository.findOneOrFail.mockResolvedValue(oldUser);
      jest
        .spyOn(service, 'sendVerification')
        .mockImplementation(async () => ({ ok: false }));
      const result = await service.editProfile(oldUser.id, args);
      expect(result).toEqual({ ok: true });
      expect(userRepository.save).toHaveBeenCalledWith({
        id: 100,
        email: 'new@test.com',
        username: 'testuser',
        verified: false,
      });
    });
    it('should change username', async () => {
      const args = {
        username: 'newname',
      };
      userRepository.findOneOrFail.mockResolvedValue(oldUser);
      const result = await service.editProfile(oldUser.id, args);
      expect(result).toEqual({ ok: true });
      expect(userRepository.save).toHaveBeenCalledWith({
        id: 100,
        email: 'test@test.com',
        username: 'newname',
        verified: true,
      });
    });
    it('should fail to change if user not found', async () => {
      const args = {
        username: 'newname',
      };
      userRepository.findOneOrFail.mockRejectedValue(new Error());
      const result = await service.editProfile(oldUser.id, args);
      expect(result).toEqual({
        ok: false,
        error: '변경사항이 적용되지 않았습니다.',
      });
      expect(userRepository.save).toHaveBeenCalledTimes(0);
    });
  });

  describe('verifyEmail', () => {
    const mockedToken = { code: '', id: 10, user: { verified: false } };
    beforeEach(() => {
      mockedToken.code = '1234';
      mockedToken.id = 10;
      mockedToken.user = { verified: false };
    });
    it('should verify email', async () => {
      verificationRepository.findOneOrFail.mockResolvedValue(mockedToken);
      const result = await service.verifyEmail('1234');
      expect(userRepository.save).toHaveBeenCalledWith({ verified: true });
      expect(verificationRepository.delete).toHaveBeenCalledWith(10);
      expect(result).toEqual({ ok: true });
    });
    it('should fail on verification not found or exception', async () => {
      verificationRepository.findOneOrFail.mockRejectedValue(new Error());
      const result = await service.verifyEmail('1234');
      expect(userRepository.save).toHaveBeenCalledTimes(0);
      expect(verificationRepository.delete).toHaveBeenCalledTimes(0);
      expect(result).toEqual({ ok: false, error: '인증에 실패하였습니다.' });
    });
  });

  describe('sendVerification', () => {
    const mockedUser: User = {
      email: 'test@test.com',
      username: 'test',
      id: 1,
      role: UserRole.Client,
      password: '1234',
      verified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const mockedCode = '1234';
    it('should fail on exception', async () => {
      verificationRepository.create.mockReturnValue({ user: mockedUser });
      verificationRepository.save.mockRejectedValue(new Error());
      const result = await service.sendVerification(mockedUser);
      expect(mailService.verify).toHaveBeenCalledTimes(0);
      expect(verificationRepository.delete).toHaveBeenCalledTimes(1);
      expect(verificationRepository.delete).toHaveBeenCalledWith({
        user: mockedUser,
      });
      expect(result).toEqual({
        ok: false,
        error: '인증메일 전송에 실패하였습니다.',
      });
    });
    it('should send verification', async () => {
      verificationRepository.create.mockReturnValue({ user: mockedUser });
      verificationRepository.save.mockResolvedValue({ code: mockedCode });
      const result = await service.sendVerification(mockedUser);
      expect(mailService.verify).toHaveBeenCalledTimes(1);
      expect(verificationRepository.delete).toHaveBeenCalledTimes(1);
      expect(mailService.verify).toHaveBeenCalledWith(
        mockedUser.email,
        mockedCode,
      );
      expect(result).toEqual({ ok: true });
    });
  });
});
