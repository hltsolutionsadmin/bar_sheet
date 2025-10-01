import { Product } from './product';
import { Shop } from './shop';

export class SalesProduct {
  id: number;
  shopId: number;
  shop?: Shop;
  productId: number;
  product?: Product;
  dailyReportId: string;
  dailyReport: string;
  quantitySold: number;
  oB_Q: number;
  oB_P: number;
  oB_N: number;
  cB_Q: number;
  cB_P: number;
  cB_N: number;
  rC_Q: number;
  rC_P: number;
  rC_N: number;
  sP_Q: number;
  sP_P: number;
  sP_N: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: any) {
    this.id = data.id || 0;
    this.shopId = data.shopId || 0;
    this.shop = data.shop ? new Shop(data.shop) : new Shop({});
    this.productId = data.productId || 0;
    this.product = data.product ? new Product(data.product) : new Product({});
    this.dailyReportId = data.dailyReportId || '';
    this.dailyReport = data.dailyReport || '';
    this.quantitySold = data.quantitySold || 0;
    this.oB_Q = data.oB_Q || 0;
    this.oB_P = data.oB_P || 0;
    this.oB_N = data.oB_N || 0;
    this.cB_Q = data.cB_Q || 0;
    this.cB_P = data.cB_P || 0;
    this.cB_N = data.cB_N || 0;
    this.rC_Q = data.rC_Q || 0;
    this.rC_P = data.rC_P || 0;
    this.rC_N = data.rC_N || 0;
    this.sP_Q = data.sP_Q || 0;
    this.sP_P = data.sP_P || 0;
    this.sP_N = data.sP_N || 0;
    this.createdBy = data.createdBy || '';
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }
}
