import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private http: HttpClient, private api: ApiService) {}

  // ─── READ ────────────────────────────────────────────────────────────────
  getProductos(): Observable<any[]> {
    return this.http.get<any[]>(this.api.getApiUrl('productos'))
      .pipe(
        map(arr => (Array.isArray(arr) ? arr : []).map(p => ({
            ...p,
            nombre: p.nombre || p.name,
            descripcion: p.descripcion || p.description,
            imagen: p.imagen || (p.imagenes && p.imagenes.length > 0 ? p.imagenes[0] : 'assets/img/placeholder.png')
        })))
      );
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
