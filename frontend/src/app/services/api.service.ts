import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.baseUrl;

  getApiUrl(endpoint: string): string {
    return `${this.baseUrl}/${endpoint}`;
  }
}
