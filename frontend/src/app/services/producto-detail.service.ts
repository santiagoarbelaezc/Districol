import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
    providedIn: 'root'
})
export class ProductoDetailService {

    constructor(private http: HttpClient, private api: ApiService) {}

    getProductoPorId(id: number): Observable<any> {
        return this.http.get<any>(this.api.getApiUrl(`productos/${id}`));
    }

    getProductosRelacionados(categoriaId: number, excludeId: number, limit: number = 4): Observable<any[]> {
        return this.http.get<any[]>(this.api.getApiUrl(`productos?categoria_id=${categoriaId}&exclude_id=${excludeId}&limit=${limit}`));
    }

    getProductosPorCategoria(categoriaId: number, limit: number = 8): Observable<any[]> {
        return this.http.get<any[]>(this.api.getApiUrl(`productos?categoria_id=${categoriaId}&limit=${limit}`));
    }

    getProductosDeInteres(excludeId: number, limit: number = 6): Observable<any[]> {
        return this.http.get<any[]>(this.api.getApiUrl(`productos/interes/aleatorios?cantidad=${limit}&exclude_id=${excludeId}`));
    }
}
