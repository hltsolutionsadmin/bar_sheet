import { SalesProduct } from '../Services/Sales/sale.service';
import { Category } from './category';
import { DailyReport } from './dailyReport';
import { Product } from './product';
import { ProductSize } from './productSize';
import { User } from './user';

export class Shop {
  id: number;
  name: string;
  identity: string;
  address: string;
  contactNumber: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  users?: Array<User>[];
  products?: Array<Product>[];
  productSizes?: Array<ProductSize>[];
  categories?: Array<Category>[];
  dailySalesReports?: Array<DailyReport>[];
  salesProducts?: Array<SalesProduct>[];

  constructor(data: any) {
    this.id = data.id || 0;
    this.name = data.name || '';
    this.identity = data.identity || '';
    this.address = data.address || '';
    this.contactNumber = data.contactNumber || '';
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
    this.createdBy = data.createdBy || '';
    this.users = data.users || [];
    this.products = data.products || [];
    this.productSizes = data.productSizes || [];
    this.categories = data.categories || [];
    this.dailySalesReports = data.dailySalesReports || [];
    this.salesProducts = data.salesProducts || [];
  }
}
