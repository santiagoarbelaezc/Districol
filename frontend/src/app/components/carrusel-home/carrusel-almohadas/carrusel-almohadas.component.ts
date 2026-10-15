import { Component, OnInit, inject } from '@angular/core';
import { CarruselHomeComponent, ProductoCarrusel } from '../carrusel-home.component';
import { DistricolService } from '../../../services/districol.service';

@Component({
    selector: 'app-carrusel-almohadas',
    standalone: true,
    imports: [CarruselHomeComponent],
    templateUrl: './carrusel-almohadas.component.html',
    styleUrl: './carrusel-almohadas.component.css'
})
export class CarruselAlmohadasComponent implements OnInit {
  private districolService = inject(DistricolService);
  productos: ProductoCarrusel[] = [];

  ngOnInit(): void {
    this.districolService.getAdaptedProducts().subscribe(all => {
      this.productos = all
        .filter(p => p.categoriaId === 2 || p.categoriaId === 3)
        .map(p => ({
          id: p.id,
          imagen: p.imagen,
          nombre: p.nombre,
          descripcion: p.descripcion,
          tag: p.tag,
          badgePromo: p.badgePromo,
          badgeType: p.badgeType as any,
          precio: p.precio
        }));
    });
  }
}
