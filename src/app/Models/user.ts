import { Shop } from './shop';

export class User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  shopId: number;
  shop: Shop;
  refreshToken: string;
  refreshTokenExpiryTime: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: any) {
    this.id = data.id || 0;
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.email = data.email || '';
    this.phoneNumber = data.phoneNumber || '';
    this.role = data.role || 'user';
    this.shopId = data.shopId || 0;
    this.shop = data.shop ? new Shop(data.shop) : new Shop({});
    this.refreshToken = data.refreshToken || '';
    this.refreshTokenExpiryTime = data.refreshTokenExpiryTime || '';
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }
}
