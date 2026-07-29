import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductoDetailService } from '../../../services/producto-detail.service';
import { Producto, MOCK_PRODUCTOS } from '../../../data/mock-products';
import { getProductSlug } from '../../../utils/seo-slug.util';

@Component({
    selector: 'app-carrusel-category',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './descripcion.component.html',
    styleUrl: './descripcion.component.css'
})
export class CarruselCategoryComponent implements OnInit {
  @Input() categoriaId: number = 0;
  @Input() titulo: string = 'Más productos';
  @Input() subtitulo: string = '';

  productos: Producto[] = [];

  constructor(
    private productoService: ProductoDetailService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (this.categoriaId && this.categoriaId > 0) {
      this.productoService.getProductosPorCategoria(this.categoriaId).subscribe({
        next: (productos) => {
          this.productos = productos && productos.length > 0 ? productos : MOCK_PRODUCTOS.filter(p => p.categoriaId === this.categoriaId);
        },
        error: () => {
          this.productos = MOCK_PRODUCTOS.filter(p => p.categoriaId === this.categoriaId);
        }
      });
    } else {
      // Cargar catálogo completo para "Más productos" con sus badges y gadgets promocionales
      this.productos = MOCK_PRODUCTOS;
    }
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(precio);
  }

  verProducto(producto: Producto): void {
    const slug = getProductSlug(producto.id, producto.nombre);
    this.router.navigate(['/productos', slug]);
  }

  scrollCarousel(direction: 'prev' | 'next'): void {
    const carousel = document.getElementById(`cat-carousel-${this.categoriaId}`);
    if (!carousel) return;
    const scrollAmount = 320;
    carousel.scrollTo({
      left: direction === 'next'
        ? carousel.scrollLeft + scrollAmount
        : carousel.scrollLeft - scrollAmount,
      behavior: 'smooth'
    });
  }
}
