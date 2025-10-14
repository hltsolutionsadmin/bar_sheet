import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { User, AuthService } from '../../../Services/Auth/auth.service';
import { MatSidenav } from '@angular/material/sidenav';
import { MatTableDataSource } from '@angular/material/table';
import {
  SalesProduct,
  DashboardStats,
  SalesService,
  SalesProductMock,
} from '../../../Services/Sales/sale.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  sidenavMode: 'side' | 'over' = 'side';
  sidenavOpened = true;
  currentUser: User | null = null;
  salesData: SalesProductMock[] = [];
  dashboardStats: DashboardStats | null = null;
  dataSource = new MatTableDataSource<SalesProductMock>();
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
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
      this.breakpointObserver.observe([Breakpoints.Handset]).subscribe(result => {
      if (result.matches) {
        // Mobile view
        this.sidenavMode = 'over';
        this.sidenavOpened = false;
      } else {
        // Desktop view
        this.sidenavMode = 'side';
        this.sidenavOpened = true;
      }
    });
    this.loadDashboardData();
  }

  loadCategories() {}

  closeIfOver(): void {
  if (this.sidenavMode === 'over') {
    this.sidenav.close();
  }
}

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
