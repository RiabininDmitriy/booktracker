import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { User } from '../entities/user.entity';
import { UsersService } from '../users/users.service';

interface JwtPayload {
  sub: string;
  role: string;
}

type RequestUser = Pick<User, 'id' | 'email' | 'name' | 'role' | 'createdAt'>;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<RequestUser> {
    try {
      const user = await this.usersService.findById(payload.sub);

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
