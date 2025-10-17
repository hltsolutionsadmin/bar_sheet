import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProductSize } from '../../../../Models/productSize';
import { AuthService, User } from '../../../../Services/Auth/auth.service';
import { ProductSizeService } from '../../../../Services/ProductSize/product-size.service';

@Component({
  selector: 'app-product-size-modal',
  templateUrl: './product-size-modal.component.html',
  styleUrl: './product-size-modal.component.css',
})
export class ProductSizeModalComponent {
   currentUser: User | null = null;
   productSizeForm: FormGroup;

  constructor(
    private authService: AuthService,
    private productSizeService: ProductSizeService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProductSizeModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProductSize | null,
  ) {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
    this.productSizeForm = this.fb.group({
      name: [
        data ? data.name : '',
        [Validators.required, Validators.maxLength(50)],
      ],
      isActive: [Boolean(data ? data.isActive : true)],
      id: [data ? data.productSizeId : '']
    })
  }

 onSave(): void {
  if (this.productSizeForm.invalid) {
    this.productSizeForm.markAllAsTouched();
    return;
  }

  const { name, id, isActive } = this.productSizeForm.value;

  const productSize: ProductSize = {
    productSizeId: id || 0,
    name,
    isActive,
    createdAt: this.data?.createdAt || new Date(),
    createdBy: this.data?.createdBy || this.currentUser?.name || 'SYSTEM',
    updatedAt: new Date(),
    shopId: this.currentUser?.shopId || 0
  };

  // 🔹 If editing, call update service
  if (id) {
    this.productSizeService.updateProductSize(id, productSize).subscribe({
      next: (updated) => {
        this.dialogRef.close(updated);
      },
      error: (err) => {
        console.error('Error updating product size:', err);
      }
    });
  } 
  // 🔹 Otherwise, create new one
  else {
    this.productSizeService.createProductSize(productSize).subscribe({
      next: (created) => {
        this.dialogRef.close(created);
      },
      error: (err) => {
        console.error('Error creating product size:', err);
      }
    });
  }
}

  onCancel(): void {
    this.dialogRef.close();
  }
}
