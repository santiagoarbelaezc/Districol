import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductoDetailService } from '../../../services/producto-detail.service';
import { Producto } from '../../../data/mock-products';

@Component({
  selector: 'app-carrusel-category',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './descripcion.component.html',
  styleUrl: './descripcion.component.css'
})
export class CarruselCategoryComponent implements OnInit {
  @Input() categoriaId: number = 0;
  @Input() titulo: string = '';
  @Input() subtitulo: string = '';

  productos: Producto[] = [];

  constructor(
    private productoService: ProductoDetailService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (this.categoriaId) {
      this.productos = this.productoService.getProductosPorCategoria(this.categoriaId);
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
    this.router.navigate(['/productos', producto.id]);
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
