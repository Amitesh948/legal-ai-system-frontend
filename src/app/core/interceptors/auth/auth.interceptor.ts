import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getAccessToken();

  let modifiedReq = req;
  
  // Don't intercept refresh requests to prevent infinite loops
  if (req.url.includes('/auth/refresh')) {
    return next(req);
  }

  if (token) {
    modifiedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If we get a 401 Unauthorized, try to refresh the token
      if (error.status === 401 && authService.getRefreshToken()) {
        return authService.refreshToken().pipe(
          switchMap((res: any) => {
            // Token successfully refreshed, clone the original request with new token
            const newToken = authService.getAccessToken();
            const retryReq = req.clone({
              headers: req.headers.set('Authorization', `Bearer ${newToken}`)
            });
            return next(retryReq);
          }),
          catchError((refreshErr) => {
            // Refresh failed (e.g. refresh token expired)
            authService.logout();
            router.navigate(['/login']);
            return throwError(() => refreshErr);
          })
        );
      } else if (error.status === 401 || error.status === 403) {
        // No refresh token available or forbidden
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
