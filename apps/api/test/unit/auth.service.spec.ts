import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../../src/auth/auth.service';
import { UsersService } from '../../src/users/users.service';
import { UserRole } from '../../src/entities/user.entity';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: {
    findByEmail: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    setRefreshTokenHash: jest.Mock;
  };
  let jwtService: {
    sign: jest.Mock;
    verify: jest.Mock;
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    name: 'Test User',
    role: UserRole.USER,
    refreshTokenHash: 'hashed-refresh-token',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      setRefreshTokenHash: jest.fn(),
    };

    jwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    it('creates a user and returns tokens', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pw-or-token');
      usersService.create.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValueOnce('access-token');
      jwtService.sign.mockReturnValueOnce('refresh-token');

      const result = await service.register({
        email: 'new@example.com',
        password: 'password123',
        name: 'New',
      });

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.user).toEqual(mockUser);
      expect(usersService.create).toHaveBeenCalledWith({
        email: 'new@example.com',
        passwordHash: 'hashed-pw-or-token',
        name: 'New',
      });
      expect(usersService.setRefreshTokenHash).toHaveBeenCalledWith(
        'user-1',
        'hashed-pw-or-token',
      );
    });

    it('throws ConflictException if email is taken', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.register({ email: 'test@example.com', password: 'pw' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('returns tokens on valid credentials', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-refresh');
      jwtService.sign.mockReturnValueOnce('access-token');
      jwtService.sign.mockReturnValueOnce('refresh-token');

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user).toEqual(mockUser);
      expect(result.accessToken).toBe('access-token');
      expect(usersService.setRefreshTokenHash).toHaveBeenCalled();
    });

    it('throws UnauthorizedException if user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'none@example.com', password: 'pw' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException if password does not match', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('returns new tokens when refresh token is valid', async () => {
      jwtService.verify.mockReturnValue({ sub: 'user-1' });
      usersService.findById.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-refresh');
      jwtService.sign.mockReturnValueOnce('new-access');
      jwtService.sign.mockReturnValueOnce('new-refresh');

      const result = await service.refresh('valid-token');

      expect(result.accessToken).toBe('new-access');
      expect(result.refreshToken).toBe('new-refresh');
      expect(usersService.setRefreshTokenHash).toHaveBeenCalledWith(
        'user-1',
        'new-hashed-refresh',
      );
    });

    it('throws UnauthorizedException if token verification fails', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('invalid');
      });

      await expect(service.refresh('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException if user does not have refresh token hash', async () => {
      jwtService.verify.mockReturnValue({ sub: 'user-1' });
      usersService.findById.mockResolvedValue({
        ...mockUser,
        refreshTokenHash: null,
      });

      await expect(service.refresh('token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException if refresh token does not match hash', async () => {
      jwtService.verify.mockReturnValue({ sub: 'user-1' });
      usersService.findById.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.refresh('wrong-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('clears refresh token hash on valid refresh token', async () => {
      jwtService.verify.mockReturnValue({ sub: 'user-1' });
      await service.logout('valid-token');
      expect(usersService.setRefreshTokenHash).toHaveBeenCalledWith(
        'user-1',
        null,
      );
    });

    it('does nothing if refresh token is undefined', async () => {
      await service.logout(undefined);
      expect(jwtService.verify).not.toHaveBeenCalled();
      expect(usersService.setRefreshTokenHash).not.toHaveBeenCalled();
    });

    it('does not throw if token is invalid', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('invalid');
      });
      await expect(service.logout('invalid-token')).resolves.toBeUndefined();
    });
  });
});
