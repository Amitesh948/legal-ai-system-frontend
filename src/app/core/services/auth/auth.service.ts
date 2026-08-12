import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/auth';
  
  // Track authentication state
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {}

  /** Send OTP to email */
  sendOtp(data: { email: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-otp`, data);
  }

  /** Verify OTP code */
  verifyOtp(data: { email: string, otp_code: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-otp`, data);
  }

  /** Register a new user */
  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  /** Get current user profile */
  me(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  /** Update current user profile */
  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, data);
  }

  /** Update current user settings */
  updateSettings(preferences: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/settings`, { preferences });
  }

  /** Change current user password */
  changePassword(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/change-password`, data);
  }

  // --- Password Reset ---

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, new_password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { token, new_password });
  }

  /** Login and store tokens */
  login(data: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setTokens(response.data.access_token, response.data.refresh_token);
        }
      })
    );
  }

  private router = inject(Router);

  /** Logout user */
  logout(): void {
    // Optionally call backend to invalidate refresh token
    const token = this.getAccessToken();
    if (token) {
      this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
        next: () => this.clearTokens(),
        error: () => this.clearTokens() // Clear anyway even if backend fails
      });
    } else {
      this.clearTokens();
    }
  }

  /** Check if user has token (basic auth check) */
  private hasToken(): boolean {
    return !!localStorage.getItem('access_token');
  }

  /** Save tokens to local storage */
  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    this.isAuthenticatedSubject.next(true);
  }

  /** Clear tokens on logout */
  private clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  /** Retrieve the access token */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /** Retrieve the refresh token */
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  /** Refresh the access token using the refresh token */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, { refresh_token: refreshToken }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setTokens(response.data.access_token, response.data.refresh_token);
        }
      })
    );
  }
}
