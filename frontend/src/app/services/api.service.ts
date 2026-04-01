import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = 'http://localhost:8000/api';

  getApiUrl(endpoint: string): string {
    return `${this.baseUrl}/${endpoint}`;
  }
}
