import { Component, OnInit, OnChanges, SimpleChanges, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ProductoDetailService } from '../../../services/producto-detail.service';
import { Producto } from '../../../data/mock-products';

@Component({
  selector: 'app-descripcion-seleccionado',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './descripcion-select.component.html',
  styleUrl: './descripcion-select.component.css'
})
export class DescripcionSeleccionadoComponent implements OnInit, OnChanges {

  @Input() productoId: number = 0;

  producto: Producto | undefined;
  cargando = true;
  error = false;
  nombreCompleto = '';
  imagenPrincipal = '';
  imagenSeleccionadaIndex = 0;
  enlaceCopiado = false;
  zoomX = 50;
  zoomY = 50;

  constructor(
    private router: Router,
    private productoService: ProductoDetailService
  ) { }

  ngOnInit(): void {
    if (this.productoId) {
      this.cargarProducto(this.productoId);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productoId'] && !changes['productoId'].firstChange) {
      const id = changes['productoId'].currentValue;
      if (id) {
        this.cargarProducto(id);
      }
    }
  }

  private cargarProducto(id: number): void {
    this.cargando = true;
    this.error = false;

    setTimeout(() => {
      this.producto = this.productoService.getProductoPorId(id);
      if (this.producto) {
        this.nombreCompleto = this.producto.nombre;
        this.imagenPrincipal = this.producto.imagen;
        this.imagenSeleccionadaIndex = 0;
      } else {
        this.error = true;
      }
      this.cargando = false;
    }, 400);
  }

  seleccionarImagen(index: number): void {
    if (this.producto?.imagenes) {
      this.imagenSeleccionadaIndex = index;
      this.imagenPrincipal = this.producto.imagenes[index];
    }
  }

  onImageMouseMove(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    this.zoomX = ((event.clientX - rect.left) / rect.width) * 100;
    this.zoomY = ((event.clientY - rect.top) / rect.height) * 100;
  }

  onImageMouseLeave(): void {
    this.zoomX = 50;
    this.zoomY = 50;
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(precio);
  }

  generarWhatsAppLink(): string {
    const mensaje = encodeURIComponent(
      `Hola, estoy interesado en el producto: ${this.nombreCompleto}. ¿Me pueden dar más información?`
    );
    return `https://wa.me/573001234567?text=${mensaje}`;
  }

  copiarEnlace(): void {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      this.enlaceCopiado = true;
      setTimeout(() => this.enlaceCopiado = false, 2500);
    });
  }

  volverAProductos(): void {
    this.router.navigate(['/productos']);
  }

  verMasDeEstaCategoria(): void {
    this.router.navigate(['/productos']);
  }
}
