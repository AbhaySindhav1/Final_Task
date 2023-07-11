import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpParams,
} from '@angular/common/http';
import { EMPTY, Observable, catchError, of, throwError } from 'rxjs';
import { AuthService } from './Services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class AuthinterceptorInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private toaster: ToastrService
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const userdata = localStorage.getItem('userData');
    let user;

    if (userdata !== null) {
      user = JSON.parse(userdata);
    }

    if (
      user &&
      user._token &&
      request.url != 'https://fcm.googleapis.com/fcm/send'
    ) {
      const modifiedReq = request.clone({
        setHeaders: {
          Authorization: `Bearer ${user._token}`,
        },
      });

      return next.handle(modifiedReq).pipe(
        catchError((error) => {
          console.log(error);
          if (
            error.error === 'Authentication Failed' ||
            error.error === 'please auth'
          ) {
            this.authService.logout();
            return EMPTY;
          }
          throw error;
        })
      );
    } else {
      return next.handle(request);
    }
  }
}
