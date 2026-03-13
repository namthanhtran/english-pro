import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<Partial<UsersService>>;
  let jwtService: jest.Mocked<Partial<JwtService>>;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedpassword123',
    name: 'Test Account',
    isVerified: true,
    verificationToken: null,
    refreshToken: 'valid-refresh-token',
    resetPasswordToken: null,
    resetPasswordExpires: null,
  };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn().mockResolvedValue(mockUser),
      findById: jest.fn().mockResolvedValue(mockUser),
      create: jest.fn().mockResolvedValue(mockUser),
      updateProfile: jest.fn().mockResolvedValue(mockUser),
      findByVerificationToken: jest.fn(),
      findByResetToken: jest.fn(),
    } as any;

    jwtService = {
      sign: jest.fn().mockReturnValue('mocked-token'),
      verify: jest
        .fn()
        .mockReturnValue({ sub: '1', email: 'test@example.com' }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should throw an error if the user does not exist', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      await expect(
        authService.login({ email: 'fake@test.com', password: 'pw' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should successfully login a valid verified user', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const res = await authService.login({
        email: 'test@example.com',
        password: 'hashedpassword123',
      });
      expect(res.access_token).toBe('mocked-token');
      expect(res.refresh_token).toBe('mocked-token');
      expect(res.user.email).toBe('test@example.com');
      expect(usersService.updateProfile).toHaveBeenCalledWith('1', {
        refreshToken: 'mocked-token',
      });
    });
  });

  describe('logout', () => {
    it('should clear the refersh token', async () => {
      const res = await authService.logout('1');
      expect(usersService.updateProfile).toHaveBeenCalledWith('1', {
        refreshToken: null,
      });
      expect(res.message).toBe('Logged out successfully');
    });
  });
});
