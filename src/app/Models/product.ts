import { ProductSize } from './productSize';
import { Shop } from './shop';

export interface ProductVariant {
  sizeId: number;
  price: number;
  quantity: number;
  size?: ProductSize; 
}

export class Product {
  id: number;
  name: string;
  categoryId: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  shopId: number;
  shop?: Shop;
  variants: ProductVariant[];

  constructor(data: any) {
    this.id = data.id || 0;
    this.name = data.name || '';
    this.categoryId = data.categoryId || 0;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
    this.createdBy = data.createdBy || '';
    this.shopId = data.shopId || 0;
    this.shop = data.shop ? new Shop(data.shop) : new Shop({});
    this.variants = (data.variants || []).map((v: any) => ({
      sizeId: v.sizeId,
      price: v.price,
      quantity: v.quantity,
      size: v.size ? new ProductSize(v.size) : undefined,
    }));
  }
}
