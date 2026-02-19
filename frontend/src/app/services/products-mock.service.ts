import { Injectable } from '@angular/core';
import { ProductoCarrusel } from '../components/carrusel-home/carrusel-home.component';
import { PRODUCTOS_COLCHONES, PRODUCTOS_AMBIENTES, PRODUCTOS_COMPLEMENTOS, TODOS_LOS_PRODUCTOS } from '../data/mock-products';

@Injectable({
  providedIn: 'root'
})
export class ProductsMockService {

  getColchones(): ProductoCarrusel[] {
    return PRODUCTOS_COLCHONES;
  }

  getAmbientes(): ProductoCarrusel[] {
    return PRODUCTOS_AMBIENTES;
  }

  getComplementos(): ProductoCarrusel[] {
    return PRODUCTOS_COMPLEMENTOS;
  }

  getTodosLosProductos(): ProductoCarrusel[] {
    return TODOS_LOS_PRODUCTOS;
  }
}
