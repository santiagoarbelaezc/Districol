import { Component, inject } from '@angular/core';
import { CarruselHomeComponent, ProductoCarrusel } from '../carrusel-home.component';
import { ProductsMockService } from '../../../services/products-mock.service';

@Component({
  selector: 'app-carrusel-colchones',
  standalone: true,
  imports: [CarruselHomeComponent],
  templateUrl: './carrusel-colchones.component.html',
  styleUrl: './carrusel-colchones.component.css'
})
export class CarruselColchonesComponent {
  private productsMockService = inject(ProductsMockService);
  
  colchones: ProductoCarrusel[] = this.productsMockService.getColchones();
}
