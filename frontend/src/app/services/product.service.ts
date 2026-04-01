import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private http: HttpClient, private api: ApiService) {}

  // ─── READ ────────────────────────────────────────────────────────────────
  getProductos(): Observable<any[]> {
    return this.http.get<any[]>(this.api.getApiUrl('productos'));
  }

  getProductoPorId(id: number): Observable<any> {
    return this.http.get<any>(this.api.getApiUrl(`productos/${id}`));
  }

  // ─── CREATE ──────────────────────────────────────────────────────────────
  crearProducto(formData: FormData): Observable<any> {
    return this.http.post<any>(this.api.getApiUrl('productos'), formData);
  }

  // ─── UPDATE ──────────────────────────────────────────────────────────────
  actualizarProducto(id: number, formData: FormData): Observable<any> {
    return this.http.put<any>(this.api.getApiUrl(`productos/${id}`), formData);
  }

  // ─── DELETE ──────────────────────────────────────────────────────────────
  eliminarProducto(id: number): Observable<any> {
    return this.http.delete<any>(this.api.getApiUrl(`productos/${id}`));
  }

  // ─── IMPORT ──────────────────────────────────────────────────────────────
  importarDesdePlaxtilineas(): Observable<any> {
    return this.http.post<any>(this.api.getApiUrl('importar/ejecutar'), {});
  }

}
