import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { map, catchError } from 'rxjs/operators';
import { MOCK_PRODUCTOS } from '../data/mock-products';
import { parseProductIdFromParam } from '../utils/seo-slug.util';

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

    getProductoPorId(idOrParam: any): Observable<any> {
        const numericId = parseProductIdFromParam(idOrParam);
        return this.http.get<any>(this.api.getApiUrl(`productos/${numericId}`))
            .pipe(
                map(p => this.mapProduct(p)),
                catchError(err => {
                    const mock = MOCK_PRODUCTOS.find(p => p.id === numericId);
                    if (mock) {
                        return of(this.mapProduct(mock));
                    }
                    return throwError(() => err);
                })
            );
    }

    getProductosRelacionados(categoriaId: number, excludeId: number, limit: number = 4): Observable<any[]> {
        const numericExclude = parseProductIdFromParam(excludeId);
        return this.http.get<any[]>(this.api.getApiUrl(`productos?categoria_id=${categoriaId}&exclude_id=${numericExclude}&limit=${limit}`))
            .pipe(map(arr => (Array.isArray(arr) ? arr : []).map(p => this.mapProduct(p))));
    }

    getProductosPorCategoria(categoriaId: number, limit: number = 8): Observable<any[]> {
        return this.http.get<any[]>(this.api.getApiUrl(`productos?categoria_id=${categoriaId}&limit=${limit}`))
            .pipe(map(arr => (Array.isArray(arr) ? arr : []).map(p => this.mapProduct(p))));
    }

    getProductosDeInteres(excludeId: number, limit: number = 6): Observable<any[]> {
        const numericExclude = parseProductIdFromParam(excludeId);
        return this.http.get<any[]>(this.api.getApiUrl(`productos/random?cantidad=${limit}&exclude_id=${numericExclude}`))
            .pipe(map(arr => (Array.isArray(arr) ? arr : []).map(p => this.mapProduct(p))));
    }
}
