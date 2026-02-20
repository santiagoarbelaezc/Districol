import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriasMockService } from '../../services/categorias-mock.service';
import { Categoria } from '../../data/mock-categories';

@Component({
  selector: 'app-menu-categorias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu-categorias.component.html',
  styleUrl: './menu-categorias.component.css'
})
export class MenuCategoriasComponent implements OnInit {

  @Output() subcategoriaSeleccionada = new EventEmitter<{ subcategoriaId: number; categoriaId: number }>();

  categorias: Categoria[] = [];
  cargando = true;

  constructor(private categoriasService: CategoriasMockService) { }

  ngOnInit(): void {
    // Simular carga
    setTimeout(() => {
      this.categorias = this.categoriasService.getCategorias();
      this.cargando = false;
    }, 600);
  }

  toggle(cat: Categoria): void {
    cat.expanded = !cat.expanded;
  }

  seleccionarSubcategoria(subcategoriaId: number, categoriaId: number): void {
    this.subcategoriaSeleccionada.emit({ subcategoriaId, categoriaId });
  }

  verTodosProductos(): void {
    this.subcategoriaSeleccionada.emit({ subcategoriaId: 0, categoriaId: 0 });
  }
}
