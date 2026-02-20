import { Component, inject } from '@angular/core';
import { CarruselHomeComponent, ProductoCarrusel } from '../carrusel-home.component';
import { ProductsMockService } from '../../../services/products-mock.service';

@Component({
  selector: 'app-carrusel-almohadas',
  standalone: true,
  imports: [CarruselHomeComponent],
  templateUrl: './carrusel-almohadas.component.html',
  styleUrl: './carrusel-almohadas.component.css'
})
export class CarruselAlmohadasComponent {
  private productsMockService = inject(ProductsMockService);
  
  productos: ProductoCarrusel[] = [
    ...this.productsMockService.getAlmohadas(),
    ...this.productsMockService.getSabanas()
  ];
}
