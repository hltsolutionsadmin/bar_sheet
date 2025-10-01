import { Shop } from './shop';

export class ProductSize {
  productSizeId?: number;
  name: string;
  shopId: number;
  shop?: Shop;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isActive: boolean;

  constructor(data: any) {
    this.productSizeId = data.ProductSizeId || 0;
    this.name = data.Name || '';
    this.shopId = data.ShopId || 0;
    this.shop = data.Shop ? new Shop(data.Shop) : new Shop({});
    this.createdAt = data.CreatedAt ? new Date(data.CreatedAt) : new Date();
    this.updatedAt = data.UpdatedAt ? new Date(data.UpdatedAt) : new Date();
    this.createdBy = data.CreatedBy || '';
    this.isActive = data.IsActive ?? true;
  }
}
