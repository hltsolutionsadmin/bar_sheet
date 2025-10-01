import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, tap, map, catchError } from 'rxjs/operators';
import { HttpService } from '../Http/http.service';
import { Config } from '../../../assets/config';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'manager';
  shopId: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    USER: 'user',
  };

  apiUrl = Config.apiUrl; // Assuming Config is imported from assets/config

  private currentUserSubject = new BehaviorSubject<User | null>(
    this.getCurrentUser()
  );
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private httpService: HttpService) {}

  login(credentials: LoginCredentials): Observable<AuthTokens> {
    return this.httpService
      .post<any>(this.apiUrl + 'api/auth/login', credentials)
      .pipe(
        delay(1000), // Simulate API delay
        tap((data) => {
          if (data.success) {
            const tokens: AuthTokens = {
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
            };
            this.storeTokens(tokens);
            this.storeUser(data.user);
            this.currentUserSubject.next(data.user);
          }
        }),
        // Map or throw error based on response
        // Use switchMap to transform or throw
        // Import switchMap from rxjs/operators if not already
        // If not, use map and catchError
        // Here is a simple approach:
        // If success, return tokens, else throw error
        // Use map and catchError
        // Import map and catchError from rxjs/operators
        // Add them to the import if not present
        map((data) => {
          if (data.success) {
            return {
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
            } as AuthTokens;
          } else {
            throw new Error('Invalid credentials');
          }
        }),
        catchError((err) =>
          throwError(() => new Error('Login failed: ' + err.message))
        )
      );
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(this.STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(this.STORAGE_KEYS.USER);
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  hasRole(role: string): boolean {
    const currentUser = this.getCurrentUser();
    return currentUser?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const currentUser = this.getCurrentUser();
    return currentUser ? roles.includes(currentUser.role) : false;
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  isManager(): boolean {
    return this.hasRole('manager');
  }

  canAccessAdminFeatures(): boolean {
    return this.hasAnyRole(['Admin', 'Manager']);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.STORAGE_KEYS.ACCESS_TOKEN);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.STORAGE_KEYS.REFRESH_TOKEN);
  }

  getCurrentUser(): User | null {
    const userJson = localStorage.getItem(this.STORAGE_KEYS.USER);
    return userJson ? JSON.parse(userJson) : null;
  }

 refreshToken(): Observable<AuthTokens> {
  const accessToken = this.getAccessToken();
  const refreshToken = this.getRefreshToken();

  if (!accessToken || !refreshToken) {
    return throwError(() => new Error('No tokens available'));
  }

  return this.httpService
    .post<any>(this.apiUrl + 'api/Auth/refresh', {
      accessToken,
      refreshToken,
    })
    .pipe(
      map((data) => {
        if (data.success && data.accessToken && data.refreshToken) {
          const tokens: AuthTokens = {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          };
          this.storeTokens(tokens);
          return tokens;
        } else {
          throw new Error('Refresh token failed');
        }
      }),
      catchError((err) =>
        throwError(() => new Error('Refresh token failed: ' + err.message))
      )
    );
}


  private storeTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    localStorage.setItem(this.STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
  }

  private storeUser(user: User): void {
    localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(user));
  }
}
