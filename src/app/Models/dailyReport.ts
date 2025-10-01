import { SalesProduct } from './salesProduct';
import { Shop } from './shop';

export class DailyReport {
  id: number;
  shopId: number;
  shop: Shop;
  reportDate: Date;
  openingBalance: string;
  closingBalance: string;
  denomination: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  saleProducts?: Array<SalesProduct>[];

  constructor(data: any) {
    this.id = data.id || 0;
    this.shopId = data.shopId || 0;
    this.shop = data.shop ? new Shop(data.shop) : new Shop({});
    this.reportDate = data.reportDate ? new Date(data.reportDate) : new Date();
    this.openingBalance = data.openingBalance || '';
    this.closingBalance = data.closingBalance || '';
    this.denomination = data.denomination || '';
    this.description = data.description || '';
    this.createdBy = data.createdBy || '';
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
    this.saleProducts = data.saleProducts || [];
  }
}
