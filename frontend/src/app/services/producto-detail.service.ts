import { Injectable } from '@angular/core';
import { Producto, MOCK_PRODUCTOS } from '../data/mock-products';

@Injectable({
    providedIn: 'root'
})
export class ProductoDetailService {

    getProductoPorId(id: number): Producto | undefined {
        const producto = MOCK_PRODUCTOS.find(p => p.id === id);
        if (producto) {
            // Si no tiene array de imagenes, crear uno con la imagen principal
            if (!producto.imagenes || producto.imagenes.length === 0) {
                producto.imagenes = [producto.imagen];
            }
        }
        return producto;
    }

    getProductosRelacionados(categoriaId: number, excludeId: number, limit: number = 4): Producto[] {
        return MOCK_PRODUCTOS
            .filter(p => p.categoriaId === categoriaId && p.id !== excludeId)
            .slice(0, limit);
    }

    getProductosPorCategoria(categoriaId: number, limit: number = 8): Producto[] {
        return MOCK_PRODUCTOS
            .filter(p => p.categoriaId === categoriaId)
            .slice(0, limit);
    }

    getProductosDeInteres(excludeId: number, limit: number = 6): Producto[] {
        return MOCK_PRODUCTOS
            .filter(p => p.id !== excludeId)
            .sort(() => Math.random() - 0.5)
            .slice(0, limit);
    }
}
