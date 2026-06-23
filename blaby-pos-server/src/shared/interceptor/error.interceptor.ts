import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    HttpException,
    InternalServerErrorException,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { catchError } from 'rxjs/operators';
  import { getErrorMessage } from '../helpers/errormessage';
  @Injectable()
  export class ErrorsInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      return next.handle().pipe(
        catchError((error) => {
          if (error instanceof HttpException) {
            throw error;
          }
          throw new InternalServerErrorException(getErrorMessage(error));
        }),
      );
    }
  }