import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { LoginComponent } from './Components/Auth/login/login.component';
import { DashboardComponent } from './Components/Main/dashboard/dashboard.component';
import { CategoriesComponent } from './Components/Pages/categories/categories.component';
import { ProductComponent } from './Components/Pages/product/product.component';
import { ProductSizeComponent } from './Components/Pages/product-size/product-size.component';
import { ReportComponent } from './Components/Pages/report/report.component';
import { MaterialModule } from './Common/material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductSizeModalComponent } from './Components/Pages/product-size/product-size-modal/product-size-modal.component';
import { ProductModalComponent } from './Components/Pages/product/product-modal/product-modal.component';
import { ReportModalComponent } from './Components/Pages/report/report-modal/report-modal.component';
import { ToastrModule } from 'ngx-toastr';
import { SpinnerComponent } from './Common/spinner/spinner.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { TokenInterceptor } from './Common/Interceptors/token.interceptor';
import { SpinnerInterceptor } from './Common/Interceptors/spinner.interceptor';
import { CategoryModalComponent } from './Components/Pages/categories/category-modal/category-modal.component';
import { AuthInterceptor } from './Common/Interceptors/auth.interceptor';
import { RouterLinkActive, RouterOutlet } from '@angular/router';
import { DashboardContentComponent } from './Components/Main/dashboard-content/dashboard-content.component';
import { SalesReportsComponent } from './Components/Pages/report/sales-reports/sales-reports.component';
import { ReportsByDateComponent } from './Components/Pages/report/sales-reports/reports-by-date/reports-by-date.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    CategoriesComponent,
    ProductComponent,
    ProductSizeComponent,
    ReportComponent,
    ProductSizeModalComponent,
    ProductModalComponent,
    ReportModalComponent,
    SpinnerComponent,
    CategoryModalComponent,
    DashboardContentComponent,
    SalesReportsComponent,
    ReportsByDateComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule, // required animations module
    ToastrModule.forRoot(),
    HttpClientModule,
    RouterOutlet,
    RouterLinkActive
  ],
  providers: [
    provideAnimationsAsync(),
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: SpinnerInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
