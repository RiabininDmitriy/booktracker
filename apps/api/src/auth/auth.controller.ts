import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { CookieOptions, Request, Response } from 'express';
import type { User } from '../entities/user.entity';
import { AuthService, AuthTokens } from './auth.service';
import type { RequestUser } from './current-user.decorator';
import { CurrentUser } from './current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

const REFRESH_COOKIE_NAME = 'refresh_token';
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: RequestUser | undefined): RequestUser {
    if (!user) {
      throw new UnauthorizedException('Missing user context');
    }
    return user;
  }

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokens & { user: User }> {
    const result = await this.authService.register(dto);
    this.setRefreshCookie(res, req, result.refreshToken);
    return result;
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokens & { user: User }> {
    const result = await this.authService.login(dto);
    this.setRefreshCookie(res, req, result.refreshToken);
    return result;
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokens & { user: User }> {
    const refreshToken = (req.cookies as Record<string, string> | undefined)?.[
      REFRESH_COOKIE_NAME
    ];
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const result = await this.authService.refresh(refreshToken);
    this.setRefreshCookie(res, req, result.refreshToken);
    return result;
  }

  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const refreshToken = (req.cookies as Record<string, string> | undefined)?.[
      REFRESH_COOKIE_NAME
    ];
    await this.authService.logout(refreshToken);
    res.clearCookie(REFRESH_COOKIE_NAME, this.refreshCookieOptions(req));
  }

  private setRefreshCookie(
    res: Response,
    req: Request,
    refreshToken: string,
  ): void {
    res.cookie(
      REFRESH_COOKIE_NAME,
      refreshToken,
      this.refreshCookieOptions(req),
    );
  }

  private refreshCookieOptions(req: Request): CookieOptions {
    const isProduction = req.app.get('env') === 'production';

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: REFRESH_COOKIE_MAX_AGE_MS,
      path: '/auth',
    };
  }
}
