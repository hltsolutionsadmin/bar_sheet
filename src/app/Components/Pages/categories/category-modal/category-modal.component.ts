import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Category } from '../../../../Models/category';
import { CategoryService } from '../../../../Services/Category/category.service';
import { AuthService, User } from '../../../../Services/Auth/auth.service';

@Component({
  selector: 'app-category-modal',
  templateUrl: './category-modal.component.html',
  styleUrl: './category-modal.component.css',
})
export class CategoryModalComponent {
  currentUser: User | null = null;
  categoryForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<CategoryModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Category | null,
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private authService: AuthService
  ) {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
    this.categoryForm = this.fb.group({
      name: [
        data ? data.name : '',
        [Validators.required, Validators.maxLength(50)],
      ],
      id: [data ? data.id : ''],
    });
  }

  saveCategory() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }
    const { name, id } = this.categoryForm.value;
    console.log('Category saved:', {
      name: name,
      id: id,
    });
    this.categoryService
      .createCategory({
        createdAt: new Date(),
        createdBy: this.currentUser?.name || 'SYSTEM',
        id: 0,
        name: name,
        shopId: this.currentUser?.shopId || 0,
        updatedAt: new Date(),
      })
      .subscribe(
        (response) => {
          console.log('Category created successfully:', response);
          this.dialogRef.close(response); // Close modal and pass back the new category
        },
        (error) => {
          console.error('Error creating category:', error);
        }
      );
  }

  closeModal() {
    // Logic to close the modal, e.g., emit event or call service
    console.log('Modal closed');
    this.dialogRef.close();
  }
}
