import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection, Repository } from 'typeorm';
import { User } from '@user/entity/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Verification } from '@user/entity/verification.entity';
import { MailService } from '@mail/mail.service';

const testuser = {
  email: 'test@test.com',
  password: '1234',
};

const mockMailService = {
  send: jest.fn(),
  verify: jest.fn(),
};

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let verificationRepository: Repository<Verification>;
  let jwToken: string;

  const baseTest = () => request(app.getHttpServer()).post('/graphql');
  const publicTest = (query: string) => baseTest().send({ query });
  const privateTest = (query: string, token: string) =>
    baseTest()
      .set('authorization', 'Bearer ' + token)
      .send({ query });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailService)
      .useValue(mockMailService)
      .compile();

    app = module.createNestApplication();
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    verificationRepository = module.get<Repository<Verification>>(
      getRepositoryToken(Verification),
    );
    await app.init();
  });
  afterAll(async () => {
    await getConnection().dropDatabase();
    app.close();
  });

  describe('createAccount', () => {
    const query = `mutation{ 
      createAccount(user:{
        email:"${testuser.email}",
        username: "testuser",
        password: "${testuser.password}",
        role: Owner 
      }) { ok error }}`;
    it('should create account', () => {
      return publicTest(query)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBe(true);
          expect(res.body.data.createAccount.error).toBe(null);
        });
    });
    it('should fail if account already exists', () => {
      return publicTest(query)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBe(false);
          expect(res.body.data.createAccount.error).toBe(
            '이미 존재하는 이메일입니다.',
          );
        });
    });
  });

  describe('login', () => {
    const query = (password: string) => `mutation{ 
      login(user:{
        email:"${testuser.email}",
        password: "${password}",
      }) { ok error token }}`;
    it('should login with correct credentials', () => {
      return publicTest(query(testuser.password))
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res;
          expect(login.ok).toBe(true);
          expect(login.error).toBe(null);
          expect(login.token).toEqual(expect.any(String));
          jwToken = login.token;
        });
    });
    it('should fail to login with wrong credentials', () => {
      return publicTest(query(testuser.password + 'wrong'))
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res;
          expect(login.ok).toBe(false);
          expect(login.error).toBe('계정 정보가 일치하지 않습니다.');
          expect(login.token).toBe(null);
        });
    });
  });

  describe('userProfile', () => {
    let userId: number;
    const query = (id: number) => `{ userProfile(id:${id}) {
      ok error user { id } } }`;
    beforeAll(async () => {
      const [user] = await userRepository.find();
      userId = user.id;
    });
    it('should see a profile', () => {
      return privateTest(query(userId), jwToken)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { userProfile },
            },
          } = res;
          const { ok, error, user } = userProfile;
          expect(ok).toBe(true);
          expect(error).toBe(null);
          expect(user).toEqual({ id: userId });
        });
    });
    it('should fail to see a profile', () => {
      return privateTest(query(userId + 100), jwToken)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { userProfile },
            },
          } = res;
          const { ok, error, user } = userProfile;
          expect(ok).toBe(false);
          expect(error).toBe('사용자를 찾지 못했습니다.');
          expect(user).toEqual(null);
        });
    });
  });

  describe('me', () => {
    const query = '{ me { email } }';
    it('should see my profile', () => {
      return privateTest(query, jwToken)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.me).toEqual({ email: testuser.email });
        });
    });
    it('should fail to see my profile', () => {
      return publicTest(query)
        .expect(200)
        .expect((res) => {
          expect(res.body.errors[0]?.message).toBe('Forbidden resource');
        });
    });
  });

  describe('editProfile', () => {
    const query = `mutation{ editProfile(email:"new${testuser.email}") { ok error } }`;
    it('should change email', () => {
      return privateTest(query, jwToken)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { editProfile },
            },
          } = res;
          const { ok, error } = editProfile;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
    it('should fail to change email if the email is existing', () => {
      return privateTest(query, jwToken)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { editProfile },
            },
          } = res;
          const { ok, error } = editProfile;
          expect(ok).toBe(false);
          expect(error).toBe('이미 사용중인 이메일입니다.');
        });
    });
  });

  describe('verifyEmail', () => {
    let verificationCode: string;
    const query = (code: string) =>
      `mutation{ verifyEmail(code:"${code}") { ok error } }`;
    beforeAll(async () => {
      const [verification] = await verificationRepository.find();
      verificationCode = verification.code;
    });

    it('should verify email', () => {
      return publicTest(query(verificationCode))
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { verifyEmail },
            },
          } = res;
          const { ok, error } = verifyEmail;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
    it('should fail to verify if wrong code', () => {
      return publicTest(query('wrong'))
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { verifyEmail },
            },
          } = res;
          const { ok, error } = verifyEmail;
          expect(ok).toBe(false);
          expect(error).toBe('인증에 실패하였습니다.');
        });
    });
  });
});
