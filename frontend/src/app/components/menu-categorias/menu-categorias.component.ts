import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DistricolService } from '../../services/districol.service';
import { Categoria } from '../../data/mock-categories';

@Component({
    selector: 'app-menu-categorias',
    imports: [CommonModule],
    templateUrl: './menu-categorias.component.html',
    styleUrl: './menu-categorias.component.css'
})
export class MenuCategoriasComponent implements OnInit {

  @Output() subcategoriaSeleccionada = new EventEmitter<{ subcategoriaId: number; categoriaId: number }>();

  categorias: Categoria[] = [];
  cargando = true;

  constructor(private districolService: DistricolService) { }

  ngOnInit(): void {
    this.districolService.getCategoriasDinamicas().subscribe({
      next: (cats) => {
        this.categorias = cats;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando categorías dinámicas:', err);
        this.cargando = false;
      }
    });
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
