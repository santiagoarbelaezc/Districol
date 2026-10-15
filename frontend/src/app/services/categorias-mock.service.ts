import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Categoria } from '../data/mock-categories';
import { Producto } from '../data/mock-products';
import { DistricolService } from './districol.service';

@Injectable({
  providedIn: 'root'
})
export class CategoriasMockService {
  private districolService = inject(DistricolService);

  getCategorias$(): Observable<Categoria[]> {
    return this.districolService.getCategoriasDinamicas();
  }

  getTodosLosProductos$(): Observable<Producto[]> {
    return this.districolService.getAdaptedProducts();
  }
}
