import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../Services/Auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class loginGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const user = this.authService.getCurrentUser();

    if (user) {
      // User already logged in → redirect to dashboard
      this.router.navigate(['/dashboard']);
      return false;
    }
    return true;
  }
}
