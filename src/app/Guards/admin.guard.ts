import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../Services/Auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (
      this.authService.isAuthenticated() &&
      this.authService.canAccessAdminFeatures()
    ) {
      return true;
    } else if (this.authService.isAuthenticated()) {
      // User is authenticated but doesn't have admin privileges
      this.router.navigate(['/dashboard']);
      return false;
    } else {
      // User is not authenticated
      this.router.navigate(['/login']);
      return false;
    }
  }
}
