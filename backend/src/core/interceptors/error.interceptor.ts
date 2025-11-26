import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { QueryFailedError, EntityNotFoundError } from 'typeorm';

interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
}

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const path = request.url;

    return next.handle().pipe(
      catchError((error) => {
        const errorResponse = this.handleError(error, path);
        this.logError(error, request);
        return throwError(
          () => new HttpException(errorResponse, errorResponse.statusCode),
        );
      }),
    );
  }

  private handleError(error: any, path: string): ErrorResponse {
    const timestamp = new Date().toISOString();

    // Erros HTTP já tratados (HttpException)
    if (error instanceof HttpException) {
      const status = error.getStatus();
      const response = error.getResponse();

      let message = error.message;
      let errorName = this.getErrorName(status);

      if (typeof response === 'object' && response !== null) {
        const resp = response as Record<string, unknown>;
        if ('message' in resp) {
          message = Array.isArray(resp['message'])
            ? resp['message'].join(', ')
            : String(resp['message']);
        }
        if ('error' in resp) {
          errorName = String(resp['error']);
        }
      }

      return {
        statusCode: status,
        message,
        error: errorName,
        timestamp,
        path,
      };
    }

    // Erro de entidade não encontrada (TypeORM)
    if (error instanceof EntityNotFoundError) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Recurso não encontrado',
        error: 'Not Found',
        timestamp,
        path,
      };
    }

    // Erro de query (TypeORM) - violação de constraint, etc
    if (error instanceof QueryFailedError) {
      return this.handleQueryError(error, path, timestamp);
    }

    // Erros de validação do class-validator
    if (error.name === 'ValidationError') {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message || 'Erro de validação',
        error: 'Bad Request',
        timestamp,
        path,
      };
    }

    // Erro de sintaxe JSON
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'JSON inválido no corpo da requisição',
        error: 'Bad Request',
        timestamp,
        path,
      };
    }

    // Erro desconhecido - nunca expor detalhes internos
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Erro interno do servidor',
      error: 'Internal Server Error',
      timestamp,
      path,
    };
  }

  private handleQueryError(
    error: QueryFailedError,
    path: string,
    timestamp: string,
  ): ErrorResponse {
    const message = (error as any).message || '';
    const code = (error as any).code;

    // Violação de chave única (PostgreSQL: 23505, MySQL: ER_DUP_ENTRY)
    if (
      code === '23505' ||
      code === 'ER_DUP_ENTRY' ||
      message.includes('duplicate key') ||
      message.includes('Duplicate entry')
    ) {
      const field = this.extractDuplicateField(message);
      return {
        statusCode: HttpStatus.CONFLICT,
        message: field ? `${field} já está em uso` : 'Registro duplicado',
        error: 'Conflict',
        timestamp,
        path,
      };
    }

    // Violação de chave estrangeira (PostgreSQL: 23503, MySQL: ER_NO_REFERENCED_ROW)
    if (
      code === '23503' ||
      code === 'ER_NO_REFERENCED_ROW_2' ||
      message.includes('foreign key')
    ) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Referência inválida a outro recurso',
        error: 'Bad Request',
        timestamp,
        path,
      };
    }

    // Violação de not null (PostgreSQL: 23502)
    if (
      code === '23502' ||
      message.includes('not-null') ||
      message.includes('cannot be null')
    ) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Campo obrigatório não informado',
        error: 'Bad Request',
        timestamp,
        path,
      };
    }

    // Outros erros de banco
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Erro ao processar requisição no banco de dados',
      error: 'Bad Request',
      timestamp,
      path,
    };
  }

  private extractDuplicateField(message: string): string | null {
    // PostgreSQL: Key (email)=(test@test.com) already exists
    const pgMatch = message.match(/Key \((\w+)\)/);
    if (pgMatch) return pgMatch[1];

    // MySQL: Duplicate entry 'value' for key 'field'
    const mysqlMatch = message.match(/for key '(\w+)'/);
    if (mysqlMatch) return mysqlMatch[1];

    return null;
  }

  private getErrorName(status: number): string {
    const statusNames: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      422: 'Unprocessable Entity',
      500: 'Internal Server Error',
    };
    return statusNames[status] || 'Error';
  }

  private logError(error: any, request: any): void {
    const { method, url, body, user } = request;

    const logContext = {
      method,
      url,
      userId: user?.id,
      body: this.sanitizeBody(body),
    };

    if (error instanceof HttpException) {
      const status = error.getStatus();
      if (status >= 500) {
        this.logger.error(
          `[${method}] ${url}`,
          error.stack,
          JSON.stringify(logContext),
        );
      } else {
        this.logger.warn(
          `[${method}] ${url} - ${error.message}`,
          JSON.stringify(logContext),
        );
      }
    } else {
      this.logger.error(
        `[${method}] ${url} - Erro não tratado`,
        error.stack,
        JSON.stringify(logContext),
      );
    }
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;

    const sanitized = { ...body };
    const sensitiveFields = [
      'password',
      'senha',
      'token',
      'secret',
      'authorization',
    ];

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}
