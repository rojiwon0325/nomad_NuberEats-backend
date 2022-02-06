import { CONFIG_OPTIONS } from '@global/global.constant';
import { Test } from '@nestjs/testing';
import { JwtService } from './jwt.service';
import * as jwt from 'jsonwebtoken';

const TEST_KEY = 'test_key';
const TEST_ID = 12;
const TEST_TOKEN = 'token';

jest.mock('jsonwebtoken', () => {
  return {
    sign: jest.fn(() => TEST_TOKEN),
    verify: jest.fn(() => ({ id: TEST_ID })),
  };
});

describe('JwtService', () => {
  let service: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtService,
        { provide: CONFIG_OPTIONS, useValue: { privateKey: TEST_KEY } },
      ],
    }).compile();
    service = module.get<JwtService>(JwtService);
  });

  it('should ve defined', () => {
    expect(service).toBeDefined();
  });

  it('sign, should return a signed token', () => {
    const token = service.sign(TEST_ID);
    expect(typeof token).toBe('string');
    expect(jwt.sign).toHaveBeenCalledTimes(1);
    expect(jwt.sign).toHaveBeenCalledWith({ id: TEST_ID }, TEST_KEY);
  });

  it('verify, should return the decoded token', () => {
    const payload = service.verify(TEST_TOKEN);
    expect(payload).toEqual({ id: TEST_ID });
    expect(jwt.verify).toHaveBeenCalledTimes(1);
    expect(jwt.verify).toHaveBeenCalledWith(TEST_TOKEN, TEST_KEY);
  });
});
