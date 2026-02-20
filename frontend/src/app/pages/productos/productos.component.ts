import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { MenuCategoriasComponent } from '../../components/menu-categorias/menu-categorias.component';
import { ProductosListComponent } from '../../components/productos/productos.component';

@Component({
  selector: 'app-productos-page',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, MenuCategoriasComponent, ProductosListComponent],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})
export class ProductosPageComponent {

  @ViewChild('menuCategorias') menuCategorias!: MenuCategoriasComponent;
  @ViewChild('productosList') productosList!: ProductosListComponent;
  menuVisible = false;

  toggleMenu(): void {
    this.menuVisible = !this.menuVisible;
  }

  closeMenu(): void {
    this.menuVisible = false;
  }

  onSubcategoriaSeleccionada(event: { subcategoriaId: number; categoriaId: number }): void {
    this.closeMenu();
    if (this.productosList) {
      this.productosList.filtrarPorSubcategoria(event.subcategoriaId, event.categoriaId);
    }
  }
}
