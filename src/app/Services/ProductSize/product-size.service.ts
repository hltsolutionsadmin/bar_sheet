import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Config } from '../../../assets/config';
import { ProductSize } from '../../Models/productSize';
import { HttpService } from '../Http/http.service';

@Injectable({
  providedIn: 'root',
})
export class ProductSizeService {
  private apiUrl = `${Config.apiUrl}api/ProductSize`;

  constructor(private httpService: HttpService) {}

  // Get all categories
  getAllProductSizes(): Observable<ProductSize[]> {
    return this.httpService.get<ProductSize[]>(this.apiUrl);
  }

  // Get productSize by ID
  getProductSizes(id: number): Observable<ProductSize[]> {
    return this.httpService.get<ProductSize[]>(`${this.apiUrl}/${id}`);
  }

  // Create a new productSize
  createProductSize(productSize: ProductSize): Observable<ProductSize> {
    return this.httpService.post<ProductSize>(this.apiUrl, productSize);
  }

  // Update a productSize
  updateProductSize(
    id: number,
    productSize: ProductSize
  ): Observable<ProductSize> {
    return this.httpService.put<ProductSize>(
      `${this.apiUrl}/${id}`,
      productSize
    );
  }

  // Delete a productSize
  deleteProductSize(id: number): Observable<void> {
    return this.httpService.delete<void>(`${this.apiUrl}/${id}`);
  }
}
