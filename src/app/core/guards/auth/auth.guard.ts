import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';

/**
 * Route guard to prevent unauthenticated users from accessing protected routes.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If token exists, allow access
  if (authService.getAccessToken()) {
    return true;
  }

  // Otherwise, redirect to login page
  router.navigate(['/login']);
  return false;
};
