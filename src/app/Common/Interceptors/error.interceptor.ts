import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError, finalize } from 'rxjs';
import { AuthService } from '../../Services/Auth/auth.service';
import { SpinnerService } from '../../Services/Spinner/spinner.service';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private spinnerService: SpinnerService,
    private authService: AuthService,
    private toastController: ToastrService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    this.spinnerService.show(); // Start spinner for every request

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        this.spinnerService.hide(); // Hide spinner on error

        let errorMessage = '';

        // Handle different types of HTTP errors
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Client-side error: ${error.error.message}`;
        } else if (error.status === 401) {
          errorMessage = `Unauthorized Access!`;
        } else {
          // Server-side error
          errorMessage = `Server-side error: ${error.status} - ${error.message}`;
        }
        this.showErrorToast(errorMessage);

        if (error.status === 401) {
          this.authService.logout();
        }

        return throwError(() => new Error(errorMessage)); // Throw the error so other parts of the app can handle it
      }),
      // Ensure the spinner is hidden after the request completes
      finalize(() => {
        this.spinnerService.hide();
      })
    );
  }
  async showErrorToast(errorMessage: string) {
    this.toastController.error(errorMessage, 'Error', {
      timeOut: 5000,
      closeButton: true,
    });
  }
}
