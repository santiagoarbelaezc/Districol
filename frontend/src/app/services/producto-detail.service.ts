import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DistricolService } from './districol.service';
import { Producto } from '../data/mock-products';
import { parseProductIdFromParam } from '../utils/seo-slug.util';

@Injectable({
  providedIn: 'root'
})
export class ProductoDetailService {

  constructor(private districolService: DistricolService) {}

  getProductoPorId(idOrParam: any): Observable<Producto | undefined> {
    return this.districolService.getProductById(idOrParam);
  }

  getProductosRelacionados(categoriaId: number, excludeId: any, limit: number = 4): Observable<Producto[]> {
    const numericExclude = parseProductIdFromParam(excludeId);
    return this.districolService.getAdaptedProducts().pipe(
      map(prods => {
        return prods
          .filter(p => p.id !== numericExclude && (categoriaId === 0 || p.categoriaId === categoriaId))
          .slice(0, limit);
      })
    );
  }

  getProductosPorCategoria(categoriaId: number, limit: number = 8): Observable<Producto[]> {
    return this.districolService.getAdaptedProducts().pipe(
      map(prods => {
        if (!categoriaId || categoriaId === 0) {
          return prods.slice(0, limit);
        }
        return prods.filter(p => p.categoriaId === categoriaId).slice(0, limit);
      })
    );
  }

  getProductosDeInteres(excludeId: any, limit: number = 6): Observable<Producto[]> {
    const numericExclude = parseProductIdFromParam(excludeId);
    return this.districolService.getAdaptedProducts().pipe(
      map(prods => {
        const filtrados = prods.filter(p => p.id !== numericExclude);
        // Mezclar aleatoriamente para simular sugerencias dinámicas
        return [...filtrados].sort(() => 0.5 - Math.random()).slice(0, limit);
      })
    );
  }
}
