import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './Components/Auth/login/login.component';
import { DashboardComponent } from './Components/Main/dashboard/dashboard.component';
import { CategoriesComponent } from './Components/Pages/categories/categories.component';
import { AuthGuard } from './Guards/auth.guard';
import { RoleGuard } from './Guards/role.guard';
import { loginGuard } from './Guards/login.guard';
import { ProductSizeComponent } from './Components/Pages/product-size/product-size.component';
import { ProductComponent } from './Components/Pages/product/product.component';
import { DashboardContentComponent } from './Components/Main/dashboard-content/dashboard-content.component';
import { SalesReportsComponent } from './Components/Pages/report/sales-reports/sales-reports.component';
import { ReportComponent } from './Components/Pages/report/report.component';
import { ReportsByDateComponent } from './Components/Pages/report/sales-reports/reports-by-date/reports-by-date.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent , canActivate: [loginGuard]},
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: DashboardContentComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'DashboardContent',
        component: DashboardContentComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'categories',
        component: CategoriesComponent,
        canActivate: [RoleGuard],
        data: { roles: ['Admin', 'Manager'] },
      },
      {
        path: 'products',
        component: ProductComponent,
        canActivate: [RoleGuard],
        data: { roles: ['Admin', 'Manager'] },
      },
      {
        path: 'product-sizes',
        component: ProductSizeComponent,
        canActivate: [RoleGuard],
        data: { roles: ['Admin'] },
      },
      {
        path: 'reports',
        component: ReportComponent,
        canActivate: [RoleGuard],
        data: { roles: ['Admin', 'Manager'] },
      },
      {
    path: 'sales/:date',
    component: ReportsByDateComponent,
    // canActivate: [AuthGuard],
  },
    ],
  },
  // { path: '**', redirectTo: '/login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
