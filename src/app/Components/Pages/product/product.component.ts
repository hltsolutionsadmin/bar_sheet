import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { User, AuthService } from '../../../Services/Auth/auth.service';
import { ProductModalComponent } from './product-modal/product-modal.component';
import { CategoryService } from '../../../Services/Category/category.service';
import { ProductSizeService } from '../../../Services/ProductSize/product-size.service';
import { Category } from '../../../Models/category';
import { ProductSize } from '../../../Models/productSize';
import { ProductService } from '../../../Services/Product/product.service';
import { Product, ProductVariant } from '../../../Models/product';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
})
export class ProductComponent implements OnInit {
  productSizes: ProductSize[] = [];
  currentUser: User | null = null;
  categories: Category[] = [];
  products: Product[] = [];

  dataSource = new MatTableDataSource<Product>(this.products);
  displayedColumns: string[] = ['name', 'category', 'sizes', 'actions'];

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private categoryService: CategoryService,
    private productSizeService: ProductSizeService,
    private productService: ProductService
  ) {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
    this.productSizeService
      .getProductSizes(this.currentUser?.shopId || 0)
      .subscribe((sizes) => {
        this.productSizes = sizes;
      });
    this.categoryService
      .getCategory(this.currentUser?.shopId || 0)
      .subscribe((cats) => {
        this.categories = cats;
      });
  }

  ngOnInit(): void {
    this.productService
      .getProductsById(this.currentUser?.shopId || 0)
      .subscribe((prods) => {
        this.products = prods;
        this.dataSource.data = this.products;
      });
  }

  getProductSizeName(sizeId: number): string {
    const size = this.productSizes.find((s) => s.productSizeId === sizeId);
    return size ? size.name : `Size #${sizeId}`;
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find((c) => c.id === categoryId);
    return category ? category.name : 'Unknown Category';
  }

  openProductModal(product?: Product): void {
    const dialogRef = this.dialog.open(ProductModalComponent, {
      width: '600px',
      data: {
        product: product || null,
        productSizes: this.productSizes,
        categories: this.categories,
        currentUser: this.currentUser,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (product) {
          this.updateProduct(result);
        } else {
          this.addProduct(result);
        }
      }
    });
  }

  editProduct(product: Product): void {
    this.openProductModal(product);
  }

  addProduct(productData: Product): void {
    const newProduct: Product = {
      id: 0,
      name: productData.name,
      categoryId: productData.categoryId,
      shopId: productData.shopId,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'SYSTEM',
      variants: productData.variants || [],
    };

    this.products.push(newProduct);
    this.dataSource.data = [...this.products];
    this.snackBar.open('Product added successfully!', 'Close', {
      duration: 3000,
    });
  }

  updateProduct(productData: Product): void {
    const index = this.products.findIndex((p) => p.id === productData.id);
    if (index !== -1) {
      this.products[index] = { ...productData };
      this.dataSource.data = [...this.products];
      this.snackBar.open('Product updated successfully!', 'Close', {
        duration: 3000,
      });
    }
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.products = this.products.filter((p) => p.id !== id);
      this.dataSource.data = [...this.products];
      this.snackBar.open('Product deleted successfully!', 'Close', {
        duration: 3000,
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
