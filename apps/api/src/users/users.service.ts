import { randomBytes } from 'node:crypto';
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserNotFoundException } from './exceptions/user-not-found.exception';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new UserNotFoundException(id);
    }

    return user;
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  create(data: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  async setRefreshTokenHash(userId: string, refreshTokenHash: string | null): Promise<void> {
    await this.usersRepository.update({ id: userId }, { refreshTokenHash });
  }

  async updateMyProfile(
    userId: string,
    payload: {
      name?: string;
      email?: string;
    },
  ): Promise<{ user: User; emailVerificationToken: string | null }> {
    const user = await this.findById(userId);

    const normalizedName = payload.name?.trim();
    const normalizedEmail = payload.email?.trim().toLowerCase();
    let emailVerificationToken: string | null = null;

    if (payload.name !== undefined) {
      user.name = normalizedName ? normalizedName : null;
    }

    if (normalizedEmail && normalizedEmail !== user.email) {
      const existingUser = await this.findByEmail(normalizedEmail);
      if (existingUser && existingUser.id !== user.id) {
        throw new ConflictException('Email is already in use');
      }

      const token = randomBytes(24).toString('hex');
      user.pendingEmail = normalizedEmail;
      user.emailVerificationToken = token;
      user.emailVerifiedAt = null;
      emailVerificationToken = token;
    }

    const savedUser = await this.usersRepository.save(user);
    return { user: savedUser, emailVerificationToken };
  }

  async confirmPendingEmail(userId: string, token: string): Promise<User> {
    const user = await this.findById(userId);
    const pendingEmail = user.pendingEmail;
    const verificationToken = user.emailVerificationToken;

    if (!pendingEmail || !verificationToken) {
      throw new UnauthorizedException('No pending email confirmation request');
    }

    if (verificationToken !== token) {
      throw new UnauthorizedException('Invalid confirmation token');
    }

    const existingUser = await this.findByEmail(pendingEmail);
    if (existingUser && existingUser.id !== user.id) {
      throw new ConflictException('Email is already in use');
    }

    user.email = pendingEmail;
    user.pendingEmail = null;
    user.emailVerificationToken = null;
    user.emailVerifiedAt = new Date();

    return this.usersRepository.save(user);
  }
}
