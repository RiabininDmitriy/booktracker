import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';

type ErrorDetails = { field: string; messages: string[] } | { message: string; messages: string[] };

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const { response, timestamp, path } = this.getHttpContextAndMeta(host);

    if (exception instanceof HttpException) {
      const payload = this.buildHttpExceptionPayload(exception, timestamp, path);
      response.status(payload.statusCode).json(payload);
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(this.buildInternalServerErrorPayload(timestamp, path));
  }

  private getHttpContextAndMeta(host: ArgumentsHost): {
    response: Response;
    timestamp: string;
    path: string;
  } {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    return {
      response,
      timestamp: new Date().toISOString(),
      path: request.url,
    };
  }

  private buildHttpExceptionPayload(
    exception: HttpException,
    timestamp: string,
    path: string,
  ): {
    statusCode: number;
    error: string;
    message: string;
    details?: ErrorDetails[];
    path: string;
    timestamp: string;
  } {
    const statusCode = exception.getStatus();
    const error = HttpStatus[statusCode] ?? 'Error';
    const resBody = exception.getResponse();

    const normalized = this.normalizeExceptionResponse(resBody);
    const message = this.buildHttpExceptionMessage({
      normalized,
      statusCode,
      error,
    });
    const details = this.extractDetails(normalized);

    return {
      statusCode,
      error,
      message,
      ...(details ? { details } : {}),
      path,
      timestamp,
    };
  }

  private normalizeExceptionResponse(resBody: unknown): Record<string, unknown> {
    if (typeof resBody === 'string') return { message: resBody };
    if (!resBody || typeof resBody !== 'object') return {};
    return resBody as Record<string, unknown>;
  }

  private buildHttpExceptionMessage({
    normalized,
    statusCode,
    error,
  }: {
    normalized: Record<string, unknown>;
    statusCode: number;
    error: string;
  }): string {
    if (typeof normalized.message === 'string') return normalized.message;

    if (statusCode === 400) return 'Validation failed';

    return error;
  }

  private buildInternalServerErrorPayload(
    timestamp: string,
    path: string,
  ): {
    statusCode: number;
    error: string;
    message: string;
    path: string;
    timestamp: string;
  } {
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'Internal server error',
      path,
      timestamp,
    };
  }

  private extractDetails(normalized: Record<string, unknown>): ErrorDetails[] | undefined {
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
