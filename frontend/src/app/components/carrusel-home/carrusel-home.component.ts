import { Component, Input, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface ProductoCarrusel {
  id: number;
  imagen: string;
  nombre: string;
  descripcion: string;
  tag?: string;
  badgePromo?: string;
  badgeType?: 'discount' | 'promo' | 'warning';
  precio?: number;
}

@Component({
    selector: 'app-carrusel-home',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './carrusel-home.component.html',
    styleUrl: './carrusel-home.component.css'
})
export class CarruselHomeComponent implements AfterViewInit {

  @Input() productos: ProductoCarrusel[] = [];
  @Input() titulo: string = '';
  @Input() tema: 'light' | 'dark' = 'light';
  @Input() carouselId: string = 'home';

  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    this.disableManualScroll();
  }

  scrollCarousel(direction: 'prev' | 'next'): void {
    const carousel = document.getElementById(`carousel-${this.carouselId}`);
    if (!carousel) return;

    const scrollAmount = 340;
    const currentScroll = carousel.scrollLeft;

    carousel.scrollTo({
      left: direction === 'next' 
        ? currentScroll + scrollAmount 
        : currentScroll - scrollAmount,
      behavior: 'smooth'
    });
  }

  private disableManualScroll(): void {
    const carousel = document.getElementById(`carousel-${this.carouselId}`);
    if (!carousel) return;

    carousel.addEventListener('wheel', (event) => {
      const wheelEvent = event as WheelEvent;
      
      if (wheelEvent.shiftKey && wheelEvent.deltaY !== 0) {
        event.preventDefault();
        carousel.scrollBy({
          left: wheelEvent.deltaY,
          behavior: 'smooth'
        });
      }
      else if (Math.abs(wheelEvent.deltaX) > Math.abs(wheelEvent.deltaY)) {
        event.preventDefault();
        carousel.scrollBy({
          left: wheelEvent.deltaX,
          behavior: 'smooth'
        });
      }
    }, { passive: false });
  }

  verMas(producto: ProductoCarrusel): void {
    this.router.navigate(['/productos', producto.id]);
  }

  formatPrecio(precio?: number): string {
    if (!precio) return '';
    return '$ ' + precio.toLocaleString('es-CO');
  }
}
