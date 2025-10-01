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
    const { name, id , isActive} = this.productSizeForm.value;
    console.log('Product Size saved:', {
      name: name,
      id: id,
      isActive: isActive
    });
    this.productSizeService.createProductSize({
      createdAt: new Date(),
      createdBy: this.currentUser?.name || 'SYSTEM',
      updatedAt: new Date(),
      shopId: this.currentUser?.shopId || 0,
      name: name,
      isActive: isActive,
    }).subscribe(
      (response) => {
        this.dialogRef.close(response);
      },
      (error) => {
        console.error('Error creating product size:', error);
      }
    )
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
