import { Injectable } from '@angular/core';
import { Categoria, MOCK_CATEGORIAS } from '../data/mock-categories';
import { Producto, MOCK_PRODUCTOS } from '../data/mock-products';

@Injectable({
    providedIn: 'root'
})
export class CategoriasMockService {

    getCategorias(): Categoria[] {
        return MOCK_CATEGORIAS.map(cat => ({ ...cat, subcategorias: [...cat.subcategorias] }));
    }

    getProductosPorSubcategoria(subcategoriaId: number): Producto[] {
        return MOCK_PRODUCTOS.filter(p => p.subcategoriaId === subcategoriaId);
    }

    getProductosPorCategoria(categoriaId: number): Producto[] {
        return MOCK_PRODUCTOS.filter(p => p.categoriaId === categoriaId);
    }

    getTodosLosProductos(): Producto[] {
        return [...MOCK_PRODUCTOS];
    }
}
