import { Body, Controller, Get, Param, Patch, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { CurrentUser, type RequestUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { User } from '../entities/user.entity';
import { UserRole } from '../entities/user.entity';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  getUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  getUserById(@Param('id') id: string): Promise<User> {
    return this.usersService.findById(id);
  }

  @Patch('me')
  async updateMyProfile(
    @CurrentUser() user: RequestUser | undefined,
    @Body() dto: UpdateMyProfileDto,
  ): Promise<{
    user: {
      id: string;
      email: string;
      name: string | null;
      role: UserRole;
      createdAt: Date;
      pendingEmail: string | null;
      emailVerifiedAt: Date | null;
    };
    emailVerificationRequired: boolean;
    emailVerificationToken: string | null;
  }> {
    if (!user) {
      throw new UnauthorizedException('Missing user context');
    }

    const result = await this.usersService.updateMyProfile(user.id, dto);

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        createdAt: result.user.createdAt,
        pendingEmail: result.user.pendingEmail,
        emailVerifiedAt: result.user.emailVerifiedAt,
      },
      emailVerificationRequired: Boolean(result.user.pendingEmail),
      emailVerificationToken: result.emailVerificationToken,
    };
  }

  @Post('me/email/confirm')
  async confirmMyEmail(
    @CurrentUser() user: RequestUser | undefined,
    @Body() dto: ConfirmEmailDto,
  ): Promise<{
    user: {
      id: string;
      email: string;
      name: string | null;
      role: UserRole;
      createdAt: Date;
      pendingEmail: string | null;
      emailVerifiedAt: Date | null;
    };
  }> {
    if (!user) {
      throw new UnauthorizedException('Missing user context');
    }

    const updatedUser = await this.usersService.confirmPendingEmail(user.id, dto.token);
    return {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
        pendingEmail: updatedUser.pendingEmail,
        emailVerifiedAt: updatedUser.emailVerifiedAt,
      },
    };
  }
}
