import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { User, AuthService } from '../../../Services/Auth/auth.service';
import { CategoryService } from '../../../Services/Category/category.service';
import { MatDialog } from '@angular/material/dialog';
import { CategoryModalComponent } from './category-modal/category-modal.component';

interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
  icon: string;
}

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css',
})
export class CategoriesComponent {
  currentUser: User | null = null;

  categories: Category[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private categoryService: CategoryService,
    private dialogRef: MatDialog
  ) {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategory(this.currentUser?.shopId || 0).subscribe(
      (categories) => {
        this.categories = categories.map((cat) => ({
          id: cat.id.toString(),
          name: cat.name,
          description: `Category ID: ${cat.id}`,
          productCount: cat.products ? cat.products.length : 0,
          icon: 'category', // Placeholder icon
        }));
      },
      (error) => {
        console.error('Error loading categories:', error);
      }
    );
  }

  openCategoryModal(category?: Category): void {
    // Logic to open the modal goes here.
    // If using Angular Material Dialog:
    // this.dialog.open(CategoryModalComponent, { data: category || null });
    // If using another modal library, trigger it here.
    // For now, just log for demonstration:
    if (category) {
      console.log('Edit category:', category);
      this.dialogRef
        .open(CategoryModalComponent, {
          data: category,
          disableClose: true,
          closeOnNavigation: true,
        })
        .afterClosed()
        .subscribe(() => {
          this.loadCategories(); // Refresh categories after modal closes (assuming changes might have been made)
        });
    } else {
      console.log('Add new category');
      this.dialogRef
        .open(CategoryModalComponent, {
          data: null,
          disableClose: true,
          closeOnNavigation: true,
        })
        .afterClosed()
        .subscribe(() => {
          this.loadCategories(); // Refresh categories after modal closes (assuming changes might have been made)
        });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
