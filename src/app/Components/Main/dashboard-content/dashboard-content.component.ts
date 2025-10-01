import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { User, AuthService } from '../../../Services/Auth/auth.service';
import {
  SalesProduct,
  DashboardStats,
  SalesService,
} from '../../../Services/Sales/sale.service';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-content',
  templateUrl: './dashboard-content.component.html',
  styleUrl: './dashboard-content.component.css'
})
export class DashboardContentComponent {
@ViewChild('sidenav') sidenav!: MatSidenav;

  currentUser: User | null = null;
  salesData: SalesProduct[] = [];
  dashboardStats: DashboardStats | null = null;
  dataSource = new MatTableDataSource<SalesProduct>();
  displayedColumns: string[] = [
    'productName',
    'category',
    'quantity',
    'unitPrice',
    'totalPrice',
    'saleDate',
    'salesperson',
  ];

  constructor(
    private authService: AuthService,
    private salesService: SalesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });

    this.loadDashboardData();
  }

  loadCategories() {}

  loadDashboardData(): void {
    this.salesService.getDailySales().subscribe((sales) => {
      this.salesData = sales;
      this.dataSource.data = sales;
    });

    this.salesService.getDashboardStats().subscribe((stats) => {
      this.dashboardStats = stats;
    });
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  canAccessAdminFeatures(): boolean {
    return this.authService.canAccessAdminFeatures();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
