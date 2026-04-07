import type { UserRole } from '../../entities/user.entity';

export class AuthUserDto {
  id: string;
  email: string;
  name: string | null;
  pendingEmail: string | null;
  emailVerifiedAt: Date | null;
  role: UserRole;
  createdAt: Date;
}

export class AuthResponseDto {
  accessToken: string;
  user: AuthUserDto;
}
