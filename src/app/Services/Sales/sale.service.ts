import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface SalesProduct {
  id: string;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  saleDate: Date;
  salesperson: string;
}

export interface DashboardStats {
  totalSales: number;
  totalRevenue: number;
  totalProducts: number;
  avgOrderValue: number;
}

export interface SalesReportResponse {
  date: string;
  shopId: number;
  obProductsSummary: ProductSummary[];
  receiptsProductsSummary: ProductSummary[];
  salesProductsSummary: ProductSummary[];
  cbProductsSummary: ProductSummary[];
  overallTotalAmount: number;
}

export interface ProductSummary {
  productId: number;
  sizes: {
    sizeId: number;
    quantity: number;
    price: number;
    amount: number;
  }[];
  totalAmount: number;
}

@Injectable({
  providedIn: 'root',
})
export class SalesService {
   private readonly apiUrl = 'https://localhost:7278/api/SalesReport';

  constructor(private http: HttpClient) {}
  
  private mockSalesData: SalesProduct[] = [
    {
      id: '1',
      productName: 'Old Monch',
      category: 'Gin',
      quantity: 2,
      unitPrice: 999,
      totalPrice: 1998,
      saleDate: new Date('2024-01-15'),
      salesperson: 'John Doe',
    },
    {
      id: '2',
      productName: 'KingFisher Premium',
      category: 'rum',
      quantity: 1,
      unitPrice: 1199,
      totalPrice: 1199,
      saleDate: new Date('2024-01-15'),
      salesperson: 'Jane Smith',
    },
    {
      id: '3',
      productName: 'magic movement',
      category: 'vodka',
      quantity: 3,
      unitPrice: 120,
      totalPrice: 360,
      saleDate: new Date('2024-01-14'),
      salesperson: 'Mike Johnson',
    },
    {
      id: '4',
      productName: 'absolute',
      category: 'vodka',
      quantity: 1,
      unitPrice: 899,
      totalPrice: 899,
      saleDate: new Date('2024-01-14'),
      salesperson: 'Sarah Wilson',
    },
    {
      id: '5',
      productName: "black dog",
      category: 'wine',
      quantity: 2,
      unitPrice: 89,
      totalPrice: 178,
      saleDate: new Date('2024-01-13'),
      salesperson: 'Tom Brown',
    },
  ];

  getDailySales(): Observable<SalesProduct[]> {
    return of(this.mockSalesData).pipe(delay(500));
  }

  getDashboardStats(): Observable<DashboardStats> {
    const totalSales = this.mockSalesData.length;
    const totalRevenue = this.mockSalesData.reduce(
      (sum, sale) => sum + sale.totalPrice,
      0
    );
    const totalProducts = this.mockSalesData.reduce(
      (sum, sale) => sum + sale.quantity,
      0
    );
    const avgOrderValue = totalRevenue / totalSales;

    const stats: DashboardStats = {
      totalSales,
      totalRevenue,
      totalProducts,
      avgOrderValue,
    };

    return of(stats).pipe(delay(300));
  }

   getSalesReport(shopId: number, date: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${shopId}/${date}`);
  }

   saveSalesReport(payload: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`https://localhost:7278/api/SalesReport/save`, payload, { headers });
  }

  /** Publish sales report */
  publishSalesReport(shopId: number, date: string): Observable<any> {
    return this.http.post(`https://localhost:7278/api/SalesReport/publish/${shopId}/${date}`, {});
  }

  getReports(shopId: number, pageNumber: number, pageSize: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/all/${shopId}?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
  }

   getFullSalesReport(shopId: number, date: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all/${shopId}?date=${date}&pageNumber=1&pageSize=10`);
  }

   downloadReportPdf(shopId: number, fromDate: string, toDate: string): Observable<Blob> {
    const url = `${this.apiUrl}/pdf-range/${shopId}/${fromDate}/${toDate}`;
    const headers = new HttpHeaders({ Accept: 'application/pdf' });

    return this.http.get(url, { headers, responseType: 'blob' });
  }
}
