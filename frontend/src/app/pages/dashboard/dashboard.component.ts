import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DistricolService } from '../../services/districol.service';
import { AuthService } from '../../services/auth.service';
import { getProductSlug } from '../../utils/seo-slug.util';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  // Estado de carga y métricas
  cargando = true;
  estadisticas: any = null;
  productos: any[] = [];
  productosFiltrados: any[] = [];

  // Filtros de supervisión
  busqueda = '';
  categoriaSeleccionada = 'todas';

  // Sesión administrativa
  usuario: any = null;
  mensaje = '';
  tipoMensaje: 'success' | 'error' | '' = '';

  constructor(
    private districolService: DistricolService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Protección de acceso: El backend autentica y autoriza la entrada al Dashboard
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.usuario = this.authService.getUser();
    this.cargarEstadisticas();
  }

  cargarEstadisticas(): void {
    this.cargando = true;
    this.districolService.getEstadisticas().subscribe({
      next: (data) => {
        this.estadisticas = data;
        this.productos = data?.productos || [];
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar estadísticas:', err);
        this.cargando = false;
      }
    });
  }

  aplicarFiltros(): void {
    let result = [...this.productos];

    if (this.categoriaSeleccionada !== 'todas') {
      result = result.filter(p => p.categoria === this.categoriaSeleccionada);
    }

    if (this.busqueda.trim()) {
      const term = this.busqueda.toLowerCase().trim();
      result = result.filter(p =>
        (p.nombre && p.nombre.toLowerCase().includes(term)) ||
        (p.subcategoria && p.subcategoria.toLowerCase().includes(term))
      );
    }

    this.productosFiltrados = result;
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.categoriaSeleccionada = 'todas';
    this.aplicarFiltros();
  }

  verProductoEnTienda(producto: any): void {
    const slug = producto.slug || getProductSlug(producto.id, producto.nombre);
    this.router.navigate(['/productos', slug]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor || 0);
  }
}
