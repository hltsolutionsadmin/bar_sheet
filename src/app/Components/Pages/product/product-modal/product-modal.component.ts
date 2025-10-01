import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProductSize } from '../../../../Models/productSize';
import { ProductService } from '../../../../Services/Product/product.service';
import { AuthService, User } from '../../../../Services/Auth/auth.service';
import { Category } from '../../../../Models/category';

@Component({
  selector: 'app-product-modal',
  templateUrl: './product-modal.component.html',
  styleUrl: './product-modal.component.css',
})
export class ProductModalComponent {
   productForm: FormGroup;
  productSizes: ProductSize[] = [];
  categories: Category[] = [];
  currentUser: User | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private dialogRef: MatDialogRef<ProductModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      product?: any;
      productSizes: ProductSize[];
      categories: Category[];
      currentUser: User | null;
    }
  ) {
    this.productSizes = data.productSizes;
    this.categories = data.categories;
    this.currentUser = data.currentUser;

    this.productForm = this.fb.group({
      id: [data?.product?.id ?? null], // ✅ don’t force 0, keep null if new
      name: [data?.product?.name || '', Validators.required],
      categoryId: [data?.product?.categoryId || null, Validators.required],
      productSizeIds: [[], Validators.required],
      variants: this.fb.array([]),
      shopId: [this.currentUser?.shopId || null, Validators.required],
    });

    if (data?.product?.variants?.length) {
      this.setVariants(data.product.variants);
    }
  }

  ngOnInit(): void {}

  // -------- Form helpers --------
  get variants(): FormArray {
    return this.productForm.get('variants') as FormArray;
  }

  private buildVariant(
    sizeId: number,
    sizeName: string,
    price = 0,
    quantity = 0
  ): FormGroup {
    return this.fb.group({
      sizeId: [sizeId, Validators.required],
      sizeName: [sizeName], // UI only
      price: [price, [Validators.required, Validators.min(0)]],
      quantity: [quantity, [Validators.required, Validators.min(0)]],
    });
  }

  onSizesChange(selectedSizeIds: number[]): void {
    const existingVariants = this.variants.value as any[];

    // Keep existing variants for still-selected sizes
    const updatedVariants: FormGroup[] = [];
    selectedSizeIds.forEach((sizeId) => {
      const existing = existingVariants.find((v) => v.sizeId === sizeId);
      const size = this.productSizes.find(
        (s) => s.productSizeId === sizeId
      );

      if (size) {
        if (existing) {
          // Preserve price & quantity
          updatedVariants.push(
            this.buildVariant(sizeId, size.name, existing.price, existing.quantity)
          );
        } else {
          // New size → add blank
          updatedVariants.push(this.buildVariant(sizeId, size.name));
        }
      }
    });

    // Clear and repopulate
    this.variants.clear();
    updatedVariants.forEach((v) => this.variants.push(v));

    // Ensure form control updated
    this.productForm.patchValue({ productSizeIds: selectedSizeIds });
  }

  private setVariants(existingVariants: any[]): void {
    this.variants.clear();

    existingVariants.forEach((v) => {
      const size = this.productSizes.find(
        (s) => s.productSizeId === v.sizeId
      );
      if (size) {
        this.variants.push(
          this.buildVariant(v.sizeId, size.name, v.price, v.quantity)
        );
      }
    });

    const sizeIds = existingVariants.map((v) => v.sizeId);
    this.productForm.patchValue({ productSizeIds: sizeIds });
  }

  // -------- Save handler --------
  onSave(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const formValue = this.productForm.value;
    const id = formValue.id; // ✅ explicitly read id

    const payload = {
      id,
      name: formValue.name,
      categoryId: formValue.categoryId,
      shopId: formValue.shopId,
      createdBy: this.currentUser?.name || 'SYSTEM',
      createdAt: formValue.id ? this.data.product.createdAt : new Date(), // keep original if updating
      updatedAt: new Date(),
      variants: formValue.variants.map((v: any) => ({
        sizeId: v.sizeId,
        price: v.price,
        quantity: v.quantity,
      })),
    };

    if (id) {
      this.productService.updateProduct(id, payload).subscribe({
        next: () => this.dialogRef.close(payload),
        error: (err) => console.error('Update product failed', err),
      });
    } else {
      this.productService.createProduct(payload).subscribe({
        next: () => this.dialogRef.close(payload),
        error: (err) => console.error('Create product failed', err),
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
