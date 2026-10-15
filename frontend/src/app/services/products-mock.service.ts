import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductoCarrusel } from '../components/carrusel-home/carrusel-home.component';
import { DistricolService } from './districol.service';

@Injectable({
  providedIn: 'root'
})
export class ProductsMockService {
  private districolService = inject(DistricolService);

  getColchones$(): Observable<ProductoCarrusel[]> {
    return this.districolService.getColchones();
  }

  getAlmohadas$(): Observable<ProductoCarrusel[]> {
    return this.districolService.getAlmohadas();
  }

  getSabanas$(): Observable<ProductoCarrusel[]> {
    return this.districolService.getSabanas();
  }
}
