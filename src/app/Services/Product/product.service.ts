import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Config } from '../../../assets/config';
import { Product } from '../../Models/product';
import { HttpService } from '../Http/http.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = `${Config.apiUrl}api/Product`;

  constructor(private httpService: HttpService) {}

  // Get all categories
  getProducts(): Observable<Product[]> {
    return this.httpService.get<Product[]>(this.apiUrl);
  }

  // Get product by ID
  getProductsById(id: number): Observable<Product[]> {
    return this.httpService.get<Product[]>(`${this.apiUrl}/${id}`);
  }

  // Create a new product
  createProduct(product: Product): Observable<Product> {
    return this.httpService.post<Product>(this.apiUrl, product);
  }

  // Update a product
  updateProduct(id: number, product: Product): Observable<Product> {
    return this.httpService.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  // Delete a product
  deleteProduct(id: number): Observable<void> {
    return this.httpService.delete<void>(`${this.apiUrl}/${id}`);
  }
}
