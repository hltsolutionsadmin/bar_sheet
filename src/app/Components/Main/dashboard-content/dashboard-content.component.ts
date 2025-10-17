import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { User, AuthService } from '../../../Services/Auth/auth.service';
import { SalesProduct, DashboardStats, SalesService, ProductSalesResponse } from '../../../Services/Sales/sale.service';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ProductService } from '../../../Services/Product/product.service';
import { ProductSizeService } from '../../../Services/ProductSize/product-size.service';
import { ProductSize } from '../../../Models/productSize';
import { Product } from '../../../Models/product';

@Component({
  selector: 'app-dashboard-content',
  templateUrl: './dashboard-content.component.html',
  styleUrl: './dashboard-content.component.css'
})
export class DashboardContentComponent {
 @ViewChild('sidenav') sidenav!: MatSidenav;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  currentUser: User | null = null;
  salesData: SalesProduct[] = [];
  productSizes: ProductSize[] = [];
  products: Product[] = [];
  totalAvailableQuantity: number = 0;
  totalSaleQuantity: number = 0;
  totalUnitPrice: number = 0;
  totalSalePrice: number = 0;
  dashboardStats: DashboardStats | null = null;
  dataSource = new MatTableDataSource<SalesProduct>();
  displayedColumns: string[] = [
    'productId',
    'categoryName',
    'sizeId',
    'obQuantity',
    'saleQuantity',
    'unitPrice',
    'salePrice',
  ];

  // Pagination state
  totalCount = 0;
  pageSize = 10;
  pageNumber = 1;
  pageSizeOptions = [5, 10, 25, 50];

  // selected date
  selectedDate!: Date;

  // hardcoded shop id
  shopId = 0;

  constructor(
    private authService: AuthService,
    private salesService: SalesService,
    private productService: ProductService,
     private productSizeService: ProductSizeService,
    private router: Router
  ) {
      this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
    this.productSizeService
      .getProductSizes(this.currentUser?.shopId || 0)
      .subscribe((sizes) => {
        this.productSizes = sizes;
      });
    this.productService
      .getProductsById(this.currentUser?.shopId || 0)
      .subscribe((products) => {
        this.products = products;
      });
  }

  ngOnInit(): void {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    this.selectedDate = yesterday;
    this.loadDashboardData();
    this.loadSalesPage(this.pageNumber, this.pageSize);
  }

  getProductSizeName(productSizeId: number): string {
    const size = this.productSizes.find((s) => s.productSizeId === productSizeId);
    return size ? size.name : `Size #${productSizeId}`;
  }

  getProductName(productId: number): string {
    const product = this.products.find((p) => p.id === productId);
    return product ? product.name : `Product #${productId}`;
  }

  loadCategories() {}

  loadDashboardData(): void {
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

  private formatDateToApi(date: Date): string {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  loadSalesPage(pageNumber: number, pageSize: number): void {
  this.pageNumber = pageNumber;
  this.pageSize = pageSize;
  this.shopId = this.currentUser?.shopId || 0;

  const dateStr = this.formatDateToApi(this.selectedDate);
  this.salesService
    .getProductSales(this.shopId, dateStr, pageNumber, pageSize)
    .subscribe({
      next: (resp: ProductSalesResponse) => {
       this.salesData = resp.reports;
        this.dataSource.data = resp.reports;
        this.totalCount = resp.totalCount ?? 0;

        // ✅ Bind totals from API response
        this.totalAvailableQuantity = resp.totalAvailableQuantity;
        this.totalSaleQuantity = resp.totalSaleQuantity;
        this.totalUnitPrice = resp.totalUnitPrice;
        this.totalSalePrice = resp.totalSalePrice;

        if (this.paginator) {
          this.paginator.length = this.totalCount;
          this.paginator.pageIndex = Math.max(resp.pageNumber - 1, 0);
          this.paginator.pageSize = resp.pageSize;
        }
      },
      error: (err) => {
        console.error('Failed to load product sales', err);
        this.salesData = [];
        this.dataSource.data = [];
        this.totalCount = 0;
        this.totalAvailableQuantity = 0;
        this.totalSaleQuantity = 0;
        this.totalUnitPrice = 0;
        this.totalSalePrice = 0;
      },
    });
}

  onDateSelected(date: Date | null): void {
    if (!date) return;
    this.selectedDate = date;
    this.loadSalesPage(1, this.pageSize);
  }

  onPage(event: PageEvent): void {
    const nextPage = event.pageIndex + 1;
    const size = event.pageSize;
    this.loadSalesPage(nextPage, size);
  }

  
}
