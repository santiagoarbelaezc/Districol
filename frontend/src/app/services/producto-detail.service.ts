import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { map, catchError } from 'rxjs/operators';
import { MOCK_PRODUCTOS } from '../data/mock-products';

@Injectable({
    providedIn: 'root'
})
export class ProductoDetailService {

    constructor(private http: HttpClient, private api: ApiService) {}

    private mapProduct(p: any): any {
        if (!p) return p;
        return {
            ...p,
            nombre: p.nombre || p.name,
            descripcion: p.descripcion || p.description,
            imagen: p.imagen || (p.imagenes && p.imagenes.length > 0 ? p.imagenes[0] : 'assets/img/placeholder.png')
        };
    }

    getProductoPorId(id: number): Observable<any> {
        return this.http.get<any>(this.api.getApiUrl(`productos/${id}`))
            .pipe(
                map(p => this.mapProduct(p)),
                catchError(err => {
                    const mock = MOCK_PRODUCTOS.find(p => p.id === Number(id));
                    if (mock) {
                        return of(this.mapProduct(mock));
                    }
                    return throwError(() => err);
                })
            );
    }

    getProductosRelacionados(categoriaId: number, excludeId: number, limit: number = 4): Observable<any[]> {
        return this.http.get<any[]>(this.api.getApiUrl(`productos?categoria_id=${categoriaId}&exclude_id=${excludeId}&limit=${limit}`))
            .pipe(map(arr => (Array.isArray(arr) ? arr : []).map(p => this.mapProduct(p))));
    }

    getProductosPorCategoria(categoriaId: number, limit: number = 8): Observable<any[]> {
        return this.http.get<any[]>(this.api.getApiUrl(`productos?categoria_id=${categoriaId}&limit=${limit}`))
            .pipe(map(arr => (Array.isArray(arr) ? arr : []).map(p => this.mapProduct(p))));
    }

    getProductosDeInteres(excludeId: number, limit: number = 6): Observable<any[]> {
        return this.http.get<any[]>(this.api.getApiUrl(`productos/random?cantidad=${limit}&exclude_id=${excludeId}`))
            .pipe(map(arr => (Array.isArray(arr) ? arr : []).map(p => this.mapProduct(p))));
    }
}
