import type { UserRole } from '../../entities/user.entity';

/**
 * Internal DTO used to type the data required to create a user entity.
 * (Not an external API DTO.)
 */
export class CreateUserDto {
  email: string;
  passwordHash: string;
  name: string | null;
  role?: UserRole;
}
