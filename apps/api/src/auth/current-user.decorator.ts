import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { User } from '../entities/user.entity';

export type RequestUser = Pick<
  User,
  'id' | 'email' | 'name' | 'role' | 'createdAt'
>;

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestUser | undefined => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user?: RequestUser }>();
    return request.user ?? undefined;
  },
);
