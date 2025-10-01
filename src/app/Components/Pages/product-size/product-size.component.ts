import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { User, AuthService } from '../../../Services/Auth/auth.service';
import { ProductSizeModalComponent } from './product-size-modal/product-size-modal.component';
import { ProductSizeService } from '../../../Services/ProductSize/product-size.service';
import { ProductSize } from '../../../Models/productSize';

@Component({
  selector: 'app-product-size',
  templateUrl: './product-size.component.html',
  styleUrl: './product-size.component.css',
})
export class ProductSizeComponent implements OnInit {
  currentUser: User | null = null;
  icon: string = '';
  productSizes: ProductSize[] = [];

  dataSource = new MatTableDataSource<ProductSize>(this.productSizes);
  displayedColumns: string[] = ['productName', 'size', 'isActive', 'actions'];

  constructor(
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private productSizeService: ProductSizeService,
    private cdr: ChangeDetectorRef // Added for manual change detection
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
    this.loadProductSizes();
  }

  loadProductSizes() {
    this.productSizeService.getProductSizes(this.currentUser?.shopId || 0).subscribe({
      next: (sizes) => {
        this.productSizes = sizes;
        this.icon = 'straighten';
        this.dataSource.data = this.productSizes;
        this.cdr.detectChanges(); // Ensure UI updates
      },
      error: (error) => {
        console.error('Error loading product sizes:', error);
        this.snackBar.open('Failed to load product sizes.', 'Close', { duration: 3000 });
      }
    });
  }

  openSizeModal(size?: ProductSize): void {
    const dialogRef = this.dialog.open(ProductSizeModalComponent, {
      width: '500px',
      data: size || null,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Dialog result:', result); // Debug log to inspect response
        if (size) {
          this.updateSize(result);
        } else {
          this.addSize(result);
        }
      }
    });
  }

  editSize(size: ProductSize): void {
    this.openSizeModal(size);
  }

  addSize(sizeData: ProductSize): void {
    // Validate that sizeData has a name
    if (!sizeData.name) {
      console.error('No name in sizeData:', sizeData);
      this.snackBar.open('Error: Product size name missing.', 'Close', { duration: 3000 });
      return;
    }

    // Add the new size to the array
    this.productSizes = [...this.productSizes, sizeData];
    this.dataSource.data = [...this.productSizes];
    this.cdr.detectChanges(); // Force change detection to ensure UI updates
    this.snackBar.open('Product size added successfully!', 'Close', {
      duration: 3000,
    });
  }

  updateSize(sizeData: ProductSize): void {
    const index = this.productSizes.findIndex(
      (s) => s.productSizeId === sizeData.productSizeId
    );
    if (index !== -1) {
      this.productSizes[index] = { ...sizeData };
      this.dataSource.data = [...this.productSizes];
      this.cdr.detectChanges(); // Ensure UI updates
      this.snackBar.open('Product size updated successfully!', 'Close', {
        duration: 3000,
      });
    }
  }

  deleteSize(id: number): void {
    if (confirm('Are you sure you want to delete this product size?')) {
      this.productSizes = this.productSizes.filter(
        (s) => s.productSizeId !== id
      );
      this.dataSource.data = [...this.productSizes];
      this.cdr.detectChanges(); // Ensure UI updates
      this.snackBar.open('Product size deleted successfully!', 'Close', {
        duration: 3000,
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
