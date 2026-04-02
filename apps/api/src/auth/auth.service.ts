import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

type RefreshTokenPayload = {
  sub: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const existing = await this.usersService.findByEmail(dto.email);

    if (existing) {
      throw new ConflictException('Email is already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      name: dto.name ?? null,
    });

    const tokens = this.issueTokens(user);
    await this.usersService.setRefreshTokenHash(user.id, await bcrypt.hash(tokens.refreshToken, 10));

    return { user, ...tokens };
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = this.issueTokens(user);
    await this.usersService.setRefreshTokenHash(user.id, await bcrypt.hash(tokens.refreshToken, 10));

    return { user, ...tokens };
  }

  async refresh(refreshToken: string): Promise<AuthResult> {
    const userId = this.verifyRefreshToken(refreshToken);
    const user = await this.usersService.findById(userId);

    if (!user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isMatch = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = this.issueTokens(user);
    await this.usersService.setRefreshTokenHash(user.id, await bcrypt.hash(tokens.refreshToken, 10));

    return { user, ...tokens };
  }

  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return;

    try {
      const userId = this.verifyRefreshToken(refreshToken);
      await this.usersService.setRefreshTokenHash(userId, null);
    } catch {
      // Ignore invalid/expired refresh tokens on logout
    }
  }

  private issueTokens(user: User): AuthTokens {
    const payload = { sub: user.id, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  private verifyRefreshToken(token: string): string {
    try {
      const payload = this.jwtService.verify<RefreshTokenPayload>(token);
      return payload.sub;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
