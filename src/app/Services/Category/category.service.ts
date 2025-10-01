import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../../Models/category';
import { HttpService } from '../Http/http.service';
import { Config } from '../../../assets/config';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiUrl = `${Config.apiUrl}api/Category`;

  constructor(private httpService: HttpService) {}

  // Get all categories
  getCategories(): Observable<Category[]> {
    return this.httpService.get<Category[]>(this.apiUrl);
  }

  // Get category by ID
  getCategory(id: number): Observable<Category[]> {
    return this.httpService.get<Category[]>(`${this.apiUrl}/${id}`);
  }

  // Create a new category
  createCategory(category: Category): Observable<Category> {
    return this.httpService.post<Category>(this.apiUrl, category);
  }

  // Update a category
  updateCategory(id: number, category: Category): Observable<Category> {
    return this.httpService.put<Category>(`${this.apiUrl}/${id}`, category);
  }

  // Delete a category
  deleteCategory(id: number): Observable<void> {
    return this.httpService.delete<void>(`${this.apiUrl}/${id}`);
  }
}
