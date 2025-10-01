import { Component, computed, OnInit, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { Product } from '../../../../../Models/product';
import { ProductSize } from '../../../../../Models/productSize';
import { AuthService,User } from '../../../../../Services/Auth/auth.service';
import { ProductService } from '../../../../../Services/Product/product.service';
import { ProductSizeService } from '../../../../../Services/ProductSize/product-size.service';
import { SalesService } from '../../../../../Services/Sales/sale.service';

interface ProductSummary {
  productId: number;
  categoryName: string;
  sizes: { productSizeId: number; quantity: number; price: number; amount: number }[];
  totalAmount: number;
}

interface SalesReportDetail {
  date: string;
  shopId: number;
  obProductsSummary: ProductSummary[];
  receiptsProductsSummary: ProductSummary[];
  salesProductsSummary: ProductSummary[];
  breaksProductsSummary: ProductSummary[];
  cbProductsSummary: ProductSummary[];
  totalReceiptsAmount: number;
  totalSalesAmount: number;
  totalBreaksAmount: number;
  overallTotalAmount: number;
}

interface ReportValues {
  [productSizeId: number]: number;
}

interface ReportItem {
  id: number;
  name: string;
  ob: ReportValues;
  receipts: ReportValues;
  sale: ReportValues;
  breaks: ReportValues;
  cb: ReportValues;
  amount: number;
  salesAmount: number;
}

interface ReportCategory {
  category: string;
  items: ReportItem[];
}


@Component({
  selector: 'app-reports-by-date',
  templateUrl: './reports-by-date.component.html',
  styleUrl: './reports-by-date.component.css'
})

export class ReportsByDateComponent implements OnInit{
  currentUser: User | null = null;
  reportData = signal<ReportCategory[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  reportDate: Date | null = null;
  productSizes: ProductSize[] = [];
  products: Product[] = [];
  reportDataByDate: any;

  private date: string = '';

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private productSizeService: ProductSizeService,
    private salesService: SalesService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.date = params['date'];
      if (!this.date) {
        this.error.set('Invalid date');
        this.loading.set(false);
        return;
      }
      this.reportDate = new Date(this.date);
      this.loadProductSizes();
      this.loadProducts();
      this.fetchData();
    });
  }

  cancel() {
    this.router.navigate(['/dashboard/reports']);
  }

  private loadProductSizes(): void {
    const shopId = this.currentUser?.shopId || 0;
    if (shopId === 0) return;

    this.productSizeService.getProductSizes(shopId).subscribe({
      next: (sizes) => {
        this.productSizes = sizes;
      },
      error: (err) => {
        this.snackBar.open('Failed to load product sizes', 'Close', { duration: 3000 });
      }
    });
  }

  private loadProducts(): void {
    const shopId = this.currentUser?.shopId || 0;
    if (shopId === 0) return;

    this.productService.getProductsById(shopId).subscribe({
      next: (products) => {
        this.products = products;
      },
      error: (err) => {
        this.snackBar.open('Failed to load products', 'Close', { duration: 3000 });
      }
    });
  }

  uniqueSizes = computed(() => {
    const sizes = new Set<number>();
    this.reportData().forEach((cat) =>
      cat.items.forEach((item) =>
        Object.keys(item.ob).forEach((size) => sizes.add(Number(size)))
      )
    );
    return Array.from(sizes).sort((a, b) => a - b);
  });

  totalAmount = computed(() => {
    return this.reportData().reduce((sum, cat) => {
      return sum + cat.items.reduce((catSum, item) => catSum + (item.amount || 0), 0);
    }, 0);
  });

  computedTotalSalesAmount = computed(() => {
    return this.reportData().reduce((sum, cat) => {
      return sum + cat.items.reduce((catSum, item) => catSum + (item.salesAmount || 0), 0);
    }, 0);
  });

  getProductSizeName(productSizeId: number): string {
    const size = this.productSizes.find((s) => s.productSizeId === productSizeId);
    return size ? size.name : `Size #${productSizeId}`;
  }

  getProductName(productId: number): string {
    const product = this.products.find((p) => p.id === productId);
    return product ? product.name : `Product #${productId}`;
  }

  private formatDateForApi(date: string): string {
    return date;
  }

  private fetchData(): void {
    this.loading.set(true);
    this.error.set(null);
    const shopId = this.currentUser?.shopId || 0;
    if (shopId === 0) {
      this.error.set('Invalid shop ID');
      this.loading.set(false);
      return;
    }
    const date = this.formatDateForApi(this.date);

    this.salesService
      .getFullSalesReport(shopId, date)
      .pipe(
        map((response: SalesReportDetail[]) => {
          const reportData = response[0] || {};
          this.reportDataByDate = response[0];
          return this.transformApiData(reportData);
        }),
        catchError((err) => {
          this.error.set(err.message || 'Error loading sales report');
          this.loading.set(false);
          this.snackBar.open(this.error() || 'Error', 'Close', { duration: 3000 });
          return of([]);
        })
      )
      .subscribe((data) => {
        this.reportData.set(data);
        this.loading.set(false);
      });
  }

  private transformApiData(response: SalesReportDetail): ReportCategory[] {
    if (!response || Object.keys(response).length === 0) {
      return [];
    }

    const allSizes = new Set<number>();

    (response.obProductsSummary || []).forEach((product: ProductSummary) =>
      product.sizes.forEach((variant) => allSizes.add(variant.productSizeId))
    );
    (response.cbProductsSummary || []).forEach((product: ProductSummary) =>
      product.sizes.forEach((variant) => allSizes.add(variant.productSizeId))
    );
    (response.receiptsProductsSummary || []).forEach((product: ProductSummary) =>
      product.sizes.forEach((variant) => allSizes.add(variant.productSizeId))
    );
    (response.salesProductsSummary || []).forEach((product: ProductSummary) =>
      product.sizes.forEach((variant) => allSizes.add(variant.productSizeId))
    );
    (response.breaksProductsSummary || []).forEach((product: ProductSummary) =>
      product.sizes.forEach((variant) => allSizes.add(variant.productSizeId))
    );

    const categoriesMap: { [key: string]: ReportItem[] } = {};

    (response.obProductsSummary || []).forEach((product: ProductSummary) => {
      const category = product.categoryName || 'Uncategorized';
      if (!categoriesMap[category]) {
        categoriesMap[category] = [];
      }

      const ob: ReportValues = {};
      const receipts: ReportValues = {};
      const sale: ReportValues = {};
      const breaks: ReportValues = {};
      const cb: ReportValues = {};

      const salesProduct = (response.salesProductsSummary || []).find(
        (p: ProductSummary) => p.productId === product.productId
      );
      const breaksProduct = (response.breaksProductsSummary || []).find(
        (p: ProductSummary) => p.productId === product.productId
      );
      const cbProduct = (response.cbProductsSummary || []).find(
        (p: ProductSummary) => p.productId === product.productId
      );

      Array.from(allSizes).forEach((size) => {
        const obVariant = product.sizes.find((v) => v.productSizeId === size);
        ob[size] = obVariant ? obVariant.quantity : 0;

        const receiptsProduct = (response.receiptsProductsSummary || []).find(
          (p: ProductSummary) => p.productId === product.productId
        );
        const receiptsVariant = receiptsProduct?.sizes.find((v) => v.productSizeId === size);
        receipts[size] = receiptsVariant ? receiptsVariant.quantity : 0;

        const salesVariant = salesProduct?.sizes.find((v) => v.productSizeId === size);
        sale[size] = salesVariant ? salesVariant.quantity : 0;

        const breaksVariant = breaksProduct?.sizes.find((v) => v.productSizeId === size);
        breaks[size] = breaksVariant ? breaksVariant.quantity : 0;

        const cbVariant = cbProduct?.sizes.find((v) => v.productSizeId === size);
        cb[size] = cbVariant ? cbVariant.quantity : 0;
      });

      const item: ReportItem = {
        id: product.productId,
        name: this.getProductName(product.productId),
        ob,
        receipts,
        sale,
        breaks,
        cb,
        amount: cbProduct ? cbProduct.totalAmount : 0,
        salesAmount: salesProduct ? salesProduct.totalAmount : 0,
      };

      categoriesMap[category].push(item);
    });

    return Object.keys(categoriesMap).map((category) => ({
      category,
      items: categoriesMap[category],
    }));
  }

  displayValue(val: number): string {
    return val === 0 ? '' : String(val);
  }
}
