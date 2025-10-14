import { ChangeDetectionStrategy, Component, computed, EventEmitter, Output, signal } from '@angular/core';
import { AuthService, User } from '../../../../Services/Auth/auth.service';
import { catchError, map, of } from 'rxjs';
import { ProductSizeService } from '../../../../Services/ProductSize/product-size.service';
import { ProductSize } from '../../../../Models/productSize';
import { SalesService } from '../../../../Services/Sales/sale.service';
import { ProductService } from '../../../../Services/Product/product.service';
import { Product } from '../../../../Models/product';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  prices: { [productSizeId: number]: number };
}

interface ReportCategory {
  category: string;
  items: ReportItem[];
}
@Component({
  selector: 'app-sales-reports',
  templateUrl: './sales-reports.component.html',
  styleUrl: './sales-reports.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesReportsComponent {
  currentUser: User | null = null;
  reportData = signal<ReportCategory[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  today = new Date();
  productSizes: ProductSize[] = [];
  products: Product[] = [];
  saveStatus = signal<string | null>(null);
  totalSalesAmount = signal<number>(0);
  @Output() cancel = new EventEmitter<void>();

  // New computed signal to check if any receipts, sale, or breaks have non-zero values
  hasValidData = computed(() => {
    return this.reportData().some((category) =>
      category.items.some((item) =>
        this.uniqueSizes().some((size) =>
          (item.receipts[size] || 0) > 0 ||
          (item.sale[size] || 0) > 0 ||
          (item.breaks[size] || 0) > 0
        )
      )
    );
  });

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private productSizeService: ProductSizeService,
    private salesService: SalesService,
    private snackBar: MatSnackBar
  ) {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      this.fetchData();
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

  salesAmount = computed(() => {
    return (item: ReportItem) => {
      return this.uniqueSizes().reduce((sum, size) => {
        return sum + (item.sale[size] || 0) * (item.prices[size] || 0);
      }, 0);
    };
  });

  computedTotalSalesAmount = computed(() => {
    return this.reportData().reduce((sum, cat) => {
      return sum + cat.items.reduce((catSum, item) => catSum + this.salesAmount()(item), 0);
    }, 0);
  });

  breaksAmount = computed(() => {
    return (item: ReportItem) => {
      return this.uniqueSizes().reduce((sum, size) => {
        return sum + (item.breaks[size] || 0) * (item.prices[size] || 0);
      }, 0);
    };
  });

  computedTotalBreaksAmount = computed(() => {
    return this.reportData().reduce((sum, cat) => {
      return sum + cat.items.reduce((catSum, item) => catSum + this.breaksAmount()(item), 0);
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

  private formatDateForApi(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private fetchData(): void {
    this.loading.set(true);
    this.error.set(null);
    const shopId = this.currentUser?.shopId || 1;
    const date = this.formatDateForApi(this.today);

    this.salesService
      .getSalesReport(shopId, date)
      .pipe(
        map((response) => {
          this.totalSalesAmount.set(response.totalSalesAmount || 0);
          return this.transformApiData(response);
        }),
        catchError((err) => {
          this.error.set(err.message || 'Error loading sales report');
          this.loading.set(false);
          return of([]);
        })
      )
      .subscribe((data) => {
        this.reportData.set(data);
        this.loading.set(false);
      });
  }

  private transformApiData(response: any): ReportCategory[] {
    const allSizes = new Set<number>();

    response.obProductsSummary.forEach((product: any) =>
      product.sizes.forEach((variant: any) => allSizes.add(variant.productSizeId))
    );
    response.cbProductsSummary.forEach((product: any) =>
      product.sizes.forEach((variant: any) => allSizes.add(variant.productSizeId))
    );
    response.receiptsProductsSummary.forEach((product: any) =>
      product.sizes.forEach((variant: any) => allSizes.add(variant.productSizeId))
    );
    response.salesProductsSummary.forEach((product: any) =>
      product.sizes.forEach((variant: any) => allSizes.add(variant.productSizeId))
    );
    response.breaksProductsSummary.forEach((product: any) =>
      product.sizes.forEach((variant: any) => allSizes.add(variant.productSizeId))
    );

    const categoriesMap: { [key: string]: ReportItem[] } = {};
    response.obProductsSummary.forEach((product: any) => {
      const category = product.categoryName || 'Uncategorized';
      if (!categoriesMap[category]) {
        categoriesMap[category] = [];
      }

      const ob: ReportValues = {};
      const receipts: ReportValues = {};
      const sale: ReportValues = {};
      const breaks: ReportValues = {};
      const cb: ReportValues = {};
      const prices: { [productSizeId: number]: number } = {};

      Array.from(allSizes).forEach((size) => {
        const obVariant = product.sizes.find((v: any) => v.productSizeId === size);
        ob[size] = obVariant ? obVariant.quantity : 0;
        prices[size] = obVariant ? obVariant.price : 0;

        const receiptsProduct = response.receiptsProductsSummary.find(
          (p: any) => p.productId === product.productId
        );
        const receiptsVariant = receiptsProduct?.sizes.find((v: any) => v.productSizeId === size);
        receipts[size] = receiptsVariant ? receiptsVariant.quantity : 0;

        const salesProduct = response.salesProductsSummary.find(
          (p: any) => p.productId === product.productId
        );
        const salesVariant = salesProduct?.sizes.find((v: any) => v.productSizeId === size);
        sale[size] = salesVariant ? salesVariant.quantity : 0;

        const breaksProduct = response.breaksProductsSummary.find(
          (p: any) => p.productId === product.productId
        );
        const breaksVariant = breaksProduct?.sizes.find((v: any) => v.productSizeId === size);
        breaks[size] = breaksVariant ? breaksVariant.quantity : 0;

        const cbProduct = response.cbProductsSummary.find(
          (p: any) => p.productId === product.productId
        );
        const cbVariant = cbProduct?.sizes.find((v: any) => v.productSizeId === size);
        cb[size] = cbVariant ? cbVariant.quantity : 0;
      });

      const salesProduct = response.salesProductsSummary.find(
        (p: any) => p.productId === product.productId
      );
      const salesAmount = salesProduct ? salesProduct.totalAmount : 0;

      const base: ReportItem = {
        id: product.productId,
        name: this.getProductName(product.productId),
        ob,
        receipts,
        sale,
        breaks,
        cb,
        amount: product.totalAmount,
        salesAmount,
        prices,
      };

      categoriesMap[category].push(this.recalculateItem(base));
    });

    return Object.keys(categoriesMap).map((category) => ({
      category,
      items: categoriesMap[category],
    }));
  }

  updateCell(
    event: Event,
    item: ReportItem,
    productSizeId: number,
    parentField: 'ob' | 'receipts' | 'sale' | 'breaks',
    ci: number,
    ri: number
  ): void {
    const target = event.target as HTMLElement;
    const text = target.textContent?.trim() || '0';
    const previousValue = item[parentField][productSizeId] || 0;

    // Validate numeric input
    if (!/^\d*$/.test(text)) {
      this.snackBar.open('Only numeric values are allowed', 'Close', {
        duration: 3000,
        verticalPosition: 'top',
      });
      target.textContent = this.displayValue(previousValue);
      this.autoResizeCell(target);
      return;
    }

    const newValue = Math.max(0, parseInt(text, 10) || 0); // Prevent negative values

    // Validate Sale and Breaks quantity
    if (parentField === 'sale' || parentField === 'breaks') {
      const availableStock = (item.ob[productSizeId] || 0) + (item.receipts[productSizeId] || 0);
      const otherDeduction = parentField === 'sale' ? (item.breaks[productSizeId] || 0) : (item.sale[productSizeId] || 0);
      if (newValue + otherDeduction > availableStock) {
        this.snackBar.open(`${parentField.charAt(0).toUpperCase() + parentField.slice(1)} quantity cannot exceed available stock`, 'Close', {
          duration: 3000,
          verticalPosition: 'top',
        });
        target.textContent = this.displayValue(previousValue);
        this.autoResizeCell(target);
        return;
      }
    }

    // Update the cell if validations pass
    this.reportData.update((data) => {
      const newData = [...data];
      const updatedCat = { ...newData[ci] };
      updatedCat.items = [...updatedCat.items];
      const updatedItem = { ...updatedCat.items[ri] };

      updatedItem[parentField] = {
        ...updatedItem[parentField],
        [productSizeId]: newValue,
      };

      updatedCat.items[ri] = this.recalculateItem(updatedItem);
      newData[ci] = updatedCat;
      return newData;
    });

    this.autoResizeCell(target);
  }

  // New method to filter input in real-time
  restrictToNumeric(event: Event): void {
    const target = event.target as HTMLElement;
    const text = target.textContent || '';
    const numericText = text.replace(/[^0-9]/g, '');
    if (text !== numericText) {
      target.textContent = numericText;
      // Move cursor to the end
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(target);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }

  saveReport(): void {
    this.saveStatus.set(null);
    this.error.set(null);
    const shopId = this.currentUser?.shopId || 1;
    const date = this.formatDateForApi(this.today);

    const receiptsProductsSummary: any[] = [];
    const salesProductsSummary: any[] = [];
    const breaksProductsSummary: any[] = [];

    this.reportData().forEach((cat) => {
      cat.items.forEach((item) => {
        const receiptSizes = Object.entries(item.receipts)
          .filter(([_, qty]) => qty > 0)
          .map(([productSizeId, quantity]) => ({
            productSizeId: Number(productSizeId),
            quantity,
          }));
        if (receiptSizes.length > 0) {
          receiptsProductsSummary.push({
            productId: item.id,
            sizes: receiptSizes,
          });
        }

        const saleSizes = Object.entries(item.sale)
          .filter(([_, qty]) => qty > 0)
          .map(([productSizeId, quantity]) => ({
            productSizeId: Number(productSizeId),
            quantity,
          }));
        if (saleSizes.length > 0) {
          salesProductsSummary.push({
            productId: item.id,
            sizes: saleSizes,
          });
        }

        const breaksSizes = Object.entries(item.breaks)
          .filter(([_, qty]) => qty > 0)
          .map(([productSizeId, quantity]) => ({
            productSizeId: Number(productSizeId),
            quantity,
          }));
        if (breaksSizes.length > 0) {
          breaksProductsSummary.push({
            productId: item.id,
            sizes: breaksSizes,
          });
        }
      });
    });

    const payload = {
      date,
      shopId,
      receiptsProductsSummary,
      salesProductsSummary,
      breaksProductsSummary,
      obProductsSummary: [],
      cbProductsSummary: [],
    };

    this.salesService
      .saveSalesReport(payload)
      .pipe(
        catchError((err) => {
          const errorMessage = err.message || 'Error saving report';
          if (errorMessage.includes('Report is already published')) {
            this.error.set('Report already published');
            this.snackBar.open('Report already published', 'Close', {
              duration: 3000,
              verticalPosition: 'top',
            });
          } else {
            this.error.set(errorMessage);
            this.snackBar.open('Something went wrong', 'Close', {
              duration: 3000,
              verticalPosition: 'top',
            });
            this.fetchData();
          }
          this.saveStatus.set('Error');
          return of(null);
        })
      )
      .subscribe((response) => {
        if (response) {
          this.reportData.set(this.transformApiData(response));
          this.totalSalesAmount.set(response.totalSalesAmount || 0);
          this.saveStatus.set('Draft saved successfully');
          this.error.set(null);
          this.snackBar.open('Draft saved successfully', 'Close', {
            duration: 3000,
            verticalPosition: 'top',
          });
        }
      });
  }

  // publishReport(): void {
  //   this.saveStatus.set(null);
  //   this.error.set(null);
  //   const shopId = this.currentUser?.shopId || 1;
  //   const date = this.formatDateForApi(this.today);

  //   this.salesService
  //     .publishSalesReport(shopId, date)
  //     .pipe(
  //       catchError((err) => {
  //         const errorMessage = err.message || 'Error publishing report';
  //         if (errorMessage.includes('Report is already published')) {
  //           this.error.set('Report already published');
  //           this.snackBar.open('Report already published', 'Close', {
  //             duration: 3000,
  //             verticalPosition: 'top',
  //           });
  //         } else {
  //           this.error.set(errorMessage);
  //           this.snackBar.open('Something went wrong', 'Close', {
  //             duration: 3000,
  //             verticalPosition: 'top',
  //           });
  //           this.fetchData();
  //         }
  //         this.saveStatus.set('Error');
  //         return of(null);
  //       })
  //     )
  //     .subscribe((response) => {
  //       if (response) {
  //         this.reportData.set(this.transformApiData(response));
  //         this.totalSalesAmount.set(response.totalSalesAmount || 0);
  //         this.saveStatus.set('Report published successfully');
  //         this.error.set(null);
  //         this.snackBar.open('Report published successfully', 'Close', {
  //           duration: 3000,
  //           verticalPosition: 'top',
  //         });
  //       }
  //     });
  // }

  private recalculateItem(item: ReportItem): ReportItem {
    const cb: ReportValues = {};
    let amount = 0;

    for (const size of Object.keys(item.ob).map(Number)) {
      cb[size] =
        (item.ob[size] || 0) +
        (item.receipts[size] || 0) -
        (item.sale[size] || 0) -
        (item.breaks[size] || 0);
      amount += (cb[size] || 0) * (item.prices[size] || 0);
    }

    return { ...item, cb, amount };
  }

  private autoResizeCell(cell: HTMLElement): void {
    const text = cell.textContent || '';
    const width = Math.max(40, text.length * 12);
    cell.style.width = `${width}px`;
  }

  displayValue(val: number): string {
    return val === 0 ? '' : String(val);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}