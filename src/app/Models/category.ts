import { Product } from './product';
import { Shop } from './shop';

export class Category {
  id: number;
  name: string;
  shopId: number;
  shop?: Shop;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  products?: Array<Product>[];

  constructor(data: any) {
    this.id = data.id || 0;
    this.name = data.name || '';
    this.shopId = data.shopId || 0;
    this.shop = data.shop ? new Shop(data.shop) : new Shop({});
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
    this.createdBy = data.createdBy || '';
    this.products = data.products || [];
  }
}
