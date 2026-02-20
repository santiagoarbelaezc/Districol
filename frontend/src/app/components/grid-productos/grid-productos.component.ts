import { Component, OnInit, OnChanges, SimpleChanges, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductoDetailService } from '../../services/producto-detail.service';
import { Producto } from '../../data/mock-products';

@Component({
  selector: 'app-util-grid-productos-interes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grid-productos.component.html',
  styleUrl: './grid-productos.component.css'
})
export class GridProductosInteresComponent implements OnInit, OnChanges {

  @Input() productoActualId: number = 0;

  productos: Producto[] = [];

  constructor(
    private productoService: ProductoDetailService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarProductos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productoActualId'] && !changes['productoActualId'].firstChange) {
      this.cargarProductos();
    }
  }

  private cargarProductos(): void {
    this.productos = this.productoService.getProductosDeInteres(this.productoActualId, 6);
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
}
