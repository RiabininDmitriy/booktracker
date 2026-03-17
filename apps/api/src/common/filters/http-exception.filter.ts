import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

type ErrorDetails =
  | { field: string; messages: string[] }
  | { message: string; messages: string[] };

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const timestamp = new Date().toISOString();
    const path = request.url;

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const error = HttpStatus[statusCode] ?? 'Error';
      const resBody = exception.getResponse();

      const normalized =
        typeof resBody === 'string'
          ? { message: resBody }
          : (resBody as Record<string, unknown>);

      const message =
        typeof normalized.message === 'string'
          ? normalized.message
          : statusCode === 400
            ? 'Validation failed'
            : error;

      const details = this.extractDetails(normalized);

      response.status(statusCode).json({
        statusCode,
        error,
        message,
        ...(details ? { details } : {}),
        path,
        timestamp,
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'Internal server error',
      path,
      timestamp,
    });
  }

  private extractDetails(
    normalized: Record<string, unknown>,
  ): ErrorDetails[] | undefined {
    const details = normalized.details;
    if (Array.isArray(details)) {
      return details as ErrorDetails[];
    }

    const message = normalized.message;
    if (Array.isArray(message) && message.every((m) => typeof m === 'string')) {
      return [{ message: 'validation', messages: message }];
    }

    return undefined;
  }
}
