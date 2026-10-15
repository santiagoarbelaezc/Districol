import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DistricolService } from '../../services/districol.service';
import { Producto } from '../../data/mock-products';
import { getProductSlug } from '../../utils/seo-slug.util';

@Component({
    selector: 'app-productos-list',
    imports: [CommonModule],
    templateUrl: './productos.component.html',
    styleUrl: './productos.component.css'
})
export class ProductosListComponent implements OnInit, OnDestroy {

  productos: Producto[] = [];
  todosLosProductos: Producto[] = [];
  cargando = true;
  modoBusqueda = false;
  terminoBusqueda = '';
  mensajeResultados = 'Nuestros Productos';
  private destroy$ = new Subject<void>();

  constructor(
    private districolService: DistricolService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // 1. Cargar catálogo desde la API y luego aplicar filtros de ruta
    this.districolService.getAdaptedProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (prods) => {
          this.todosLosProductos = prods;
          this.escucharQueryParams();
        },
        error: (err) => {
          console.error('Error al obtener productos de Districol:', err);
          this.todosLosProductos = [];
          this.productos = [];
          this.cargando = false;
        }
      });
  }

  private escucharQueryParams(): void {
    this.activatedRoute.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const busqueda = params['busqueda'] || '';
        const tipo = params['tipo'] || '';

        this.terminoBusqueda = busqueda;
        this.modoBusqueda = !!busqueda && tipo === 'nombre';

        if (this.modoBusqueda && this.terminoBusqueda.trim()) {
          this.cargarProductosPorBusqueda(this.terminoBusqueda);
        } else {
          this.cargarTodos();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarTodos(): void {
    this.cargando = true;
    this.modoBusqueda = false;
    this.mensajeResultados = 'Nuestros Productos';
    setTimeout(() => {
      this.productos = [...this.todosLosProductos];
      this.cargando = false;
    }, 200);
  }

  filtrarPorSubcategoria(subcategoriaId: number, categoriaId: number): void {
    if (subcategoriaId === 0 && categoriaId === 0) {
      this.cargarTodos();
      return;
    }
    this.cargando = true;
    this.modoBusqueda = false;
    setTimeout(() => {
      if (subcategoriaId > 0) {
        this.productos = this.todosLosProductos.filter(p => p.subcategoriaId === subcategoriaId);
        if (this.productos.length > 0) {
          this.mensajeResultados = this.productos[0].subcategoria;
        } else {
          this.mensajeResultados = 'Categoría seleccionada';
        }
      } else {
        this.productos = this.todosLosProductos.filter(p => p.categoriaId === categoriaId);
        if (this.productos.length > 0) {
          this.mensajeResultados = this.productos[0].categoria;
        } else {
          this.mensajeResultados = 'Categoría seleccionada';
        }
      }
      this.cargando = false;
    }, 200);
  }

  /**
   * Normaliza texto eliminando acentos para búsqueda inclusiva
   */
  private normalizarTexto(str: string): string {
    if (!str) return '';

    const mapaAcentos: { [key: string]: string } = {
      'á': 'a', 'à': 'a', 'ä': 'a', 'â': 'a', 'ā': 'a', 'ã': 'a',
      'é': 'e', 'è': 'e', 'ë': 'e', 'ê': 'e', 'ē': 'e',
      'í': 'i', 'ì': 'i', 'ï': 'i', 'î': 'i', 'ī': 'i',
      'ó': 'o', 'ò': 'o', 'ö': 'o', 'ô': 'o', 'ō': 'o', 'õ': 'o',
      'ú': 'u', 'ù': 'u', 'ü': 'u', 'û': 'u', 'ū': 'u',
      'ý': 'y', 'ÿ': 'y',
      'ñ': 'n', 'ç': 'c'
    };

    return str
      .toLowerCase()
      .split('')
      .map(char => mapaAcentos[char] || char)
      .join('')
      .trim();
  }

  /**
   * Carga productos filtrados por búsqueda de nombre
   */
  private cargarProductosPorBusqueda(termino: string): void {
    this.cargando = true;
    const terminoNorm = this.normalizarTexto(termino);

    setTimeout(() => {
      this.productos = this.todosLosProductos.filter(p => {
        const nombreNorm = this.normalizarTexto(p.nombre);
        const descNorm = this.normalizarTexto(p.descripcion);
        return nombreNorm.includes(terminoNorm) || descNorm.includes(terminoNorm);
      });

      this.actualizarMensajeResultados();
      this.cargando = false;
    }, 200);
  }

  /**
   * Actualiza mensaje de resultados según el contexto de búsqueda
   */
  private actualizarMensajeResultados(): void {
    if (this.modoBusqueda && this.terminoBusqueda.trim()) {
      if (this.productos.length === 0) {
        this.mensajeResultados = `No se encontraron resultados para "${this.terminoBusqueda}"`;
      } else if (this.productos.length === 1) {
        this.mensajeResultados = `1 resultado para "${this.terminoBusqueda}"`;
      } else {
        this.mensajeResultados = `${this.productos.length} resultados para "${this.terminoBusqueda}"`;
      }
    } else {
      this.mensajeResultados = 'Nuestros Productos';
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

  getProductoImagen(producto: Producto): string {
    return producto.imagen || '';
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/img/placeholder.png';
  }

  verDetalles(producto: Producto): void {
    const slug = getProductSlug(producto.id, producto.nombre);
    this.router.navigate(['/productos', slug]);
  }

  limpiarBusqueda(): void {
    this.terminoBusqueda = '';
    this.modoBusqueda = false;
    this.router.navigate(['/productos']);
  }
}
