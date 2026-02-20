import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { DescripcionSeleccionadoComponent } from './descripcion-select/descripcion-select.component';
import { CarruselCategoryComponent } from '../descripcion-productos/descripcion/descripcion.component';
import { GridProductosInteresComponent } from '../grid-productos/grid-productos.component';

@Component({
  selector: 'app-descripcion-producto',
  standalone: true,
  imports: [
    NavbarComponent,
    FooterComponent,
    DescripcionSeleccionadoComponent,
    CarruselCategoryComponent,
    GridProductosInteresComponent
  ],
  templateUrl: './descripcion-producto.component.html',
  styleUrl: './descripcion-producto.component.css'
})
export class DescripcionProductoComponent implements OnInit {
  productoId: number = 0;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.productoId = Number(params['id']) || 0;
    });
  }
}
