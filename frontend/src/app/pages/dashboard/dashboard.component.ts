import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service';

interface ProductoForm {
  id?: number;
  nombre: string;
  descripcion: string;
  category: string;
  precio: number;
}

@Component({
    selector: 'app-dashboard',
    imports: [CommonModule, FormsModule],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  // Sync state
  loading = false;
  mensaje = '';
  tipoMensaje: 'success' | 'error' | '' = '';

  // Products table
  productos: any[] = [];
  cargandoProductos = false;

  // Modal state
  modalAbierto = false;
  modoEdicion = false;
  guardando = false;
  eliminando = false;

  // Form
  form: ProductoForm = this.formVacio();
  originalForm: ProductoForm = this.formVacio();
  archivosSeleccionados: File[] = [];
  productoAEliminar: any = null;

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  // ─── Cargar data ─────────────────────────────────────────────────────────
  cargarProductos(): void {
    this.cargandoProductos = true;
    this.productService.getProductos().subscribe({
      next: (data) => {
        this.productos = data;
        this.cargandoProductos = false;
      },
      error: () => {
        this.cargandoProductos = false;
      }
    });
  }

  // ─── Modal CRUD ──────────────────────────────────────────────────────────
  abrirModalCrear(): void {
    this.form = this.formVacio();
    this.archivosSeleccionados = [];
    this.modoEdicion = false;
    this.modalAbierto = true;
  }

  abrirModalEditar(producto: any): void {
    this.form = {
      id:          producto.id,
      nombre:      producto.nombre || producto.name,
      descripcion: producto.descripcion || producto.description,
      category:    producto.category || 'Districol',
      precio:      producto.precio || 0,
    };
    this.originalForm = { ...this.form };
    this.archivosSeleccionados = [];
    this.modoEdicion = true;
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.form = this.formVacio();
    this.archivosSeleccionados = [];
  }

  onArchivosSeleccionados(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.archivosSeleccionados = Array.from(input.files);
    }
  }

  isFormDirty(): boolean {
    if (!this.modoEdicion) {
      // For creating, it's dirty if it has a name
      return !!this.form.nombre || this.archivosSeleccionados.length > 0;
    }

    // Compare with originalForm
    const changed = 
      this.form.nombre !== this.originalForm.nombre ||
      this.form.descripcion !== this.originalForm.descripcion ||
      this.form.category !== this.originalForm.category ||
      this.form.precio !== this.originalForm.precio ||
      this.archivosSeleccionados.length > 0;

    return changed;
  }

  guardarProducto(): void {
    if (!this.form.nombre) return;

    const fd = new FormData();
    fd.append('nombre', this.form.nombre);
    fd.append('descripcion', this.form.descripcion);
    fd.append('category', this.form.category);
    fd.append('precio', String(this.form.precio));

    // Añadir archivos con el nombre correcto para PHP
    if (this.archivosSeleccionados.length > 0) {
      for (let i = 0; i < this.archivosSeleccionados.length; i++) {
        fd.append('imagenes', this.archivosSeleccionados[i]);
      }
    }

    this.guardando = true;
    const operacion = this.modoEdicion && this.form.id
      ? this.productService.actualizarProducto(this.form.id, fd)
      : this.productService.crearProducto(fd);

    operacion.subscribe({
      next: () => {
        this.guardando = false;
        this.cerrarModal();
        this.cargarProductos();
        this.mostrarAlerta(`Producto ${this.modoEdicion ? 'actualizado' : 'creado'} con éxito`, 'success');
      },
      error: (err) => {
        this.guardando = false;
        this.mostrarAlerta('Error: ' + (err.error?.error || err.message), 'error');
      }
    });
  }

  confirmarEliminar(producto: any): void {
    this.productoAEliminar = producto;
  }

  eliminarProducto(): void {
    if (!this.productoAEliminar) return;
    this.eliminando = true;
    this.productService.eliminarProducto(this.productoAEliminar.id).subscribe({
      next: () => {
        this.eliminando = false;
        this.productoAEliminar = null;
        this.cargarProductos();
        this.mostrarAlerta('Producto eliminado correctamente', 'success');
      },
      error: (err) => {
        this.eliminando = false;
        this.productoAEliminar = null;
        this.mostrarAlerta('Error al eliminar: ' + (err.error?.error || err.message), 'error');
      }
    });
  }

  cancelarEliminar(): void {
    this.productoAEliminar = null;
  }

  // ─── Importar desde Plaxtilineas (Hostinger) ─────────────────────────────
  importarProductos(): void {
    if (confirm('¿Sincronizar productos de Districol desde el catálogo central? Esto puede tardar unos momentos.')) {
      this.loading = true;
      this.mensaje = 'Sincronizando...';
      this.tipoMensaje = '';

      this.productService.importarDesdePlaxtilineas().subscribe({
        next: (res) => {
          this.loading = false;
          if (res.importados === 0 && res.actualizados === 0) {
            this.mensaje = 'Catálogo ya está sincronizado. No hay cambios nuevos.';
            this.tipoMensaje = 'success';
          } else {
            this.mensaje = `¡Éxito! Importados: ${res.importados}, Actualizados: ${res.actualizados}.`;
            this.tipoMensaje = 'success';
          }
          this.cargarProductos();
        },
        error: (err) => {
          this.loading = false;
          this.mensaje = 'Error en importación: ' + (err.error?.error || err.message);
          this.tipoMensaje = 'error';
        }
      });
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────
  private formVacio(): ProductoForm {
    return { nombre: '', descripcion: '', category: 'Districol', precio: 0 };
  }

  private mostrarAlerta(msg: string, tipo: 'success' | 'error'): void {
    this.mensaje = msg;
    this.tipoMensaje = tipo;
    setTimeout(() => { this.mensaje = ''; this.tipoMensaje = ''; }, 5000);
  }

  getPrimerImagen(producto: any): string {
    return producto.imagenes?.[0] ?? 'assets/img/placeholder.png';
  }
}
