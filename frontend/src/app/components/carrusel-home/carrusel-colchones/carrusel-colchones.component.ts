import { Component, OnInit, inject } from '@angular/core';
import { CarruselHomeComponent, ProductoCarrusel } from '../carrusel-home.component';
import { DistricolService } from '../../../services/districol.service';

@Component({
    selector: 'app-carrusel-colchones',
    standalone: true,
    imports: [CarruselHomeComponent],
    templateUrl: './carrusel-colchones.component.html',
    styleUrl: './carrusel-colchones.component.css'
})
export class CarruselColchonesComponent implements OnInit {
  private districolService = inject(DistricolService);
  colchones: ProductoCarrusel[] = [];

  ngOnInit(): void {
    this.districolService.getColchones().subscribe(data => {
      this.colchones = data;
    });
  }
}
