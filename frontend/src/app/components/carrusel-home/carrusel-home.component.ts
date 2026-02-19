import { Component, Input, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ProductoCarrusel {
  imagen: string;
  nombre: string;
  descripcion: string;
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
  @Input() tema: 'light' | 'dark' = 'dark';
  @Input() carouselId: string = 'home';

  ngAfterViewInit(): void {
    this.disableManualScroll();
  }

  scrollCarousel(direction: 'prev' | 'next'): void {
    const carousel = document.getElementById(`carousel-${this.carouselId}`);
    if (!carousel) return;

    const scrollAmount = 350;
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

    // Scroll horizontal con Shift + rueda del mouse
    // Scroll vertical normal sin Shift
    carousel.addEventListener('wheel', (event) => {
      const wheelEvent = event as WheelEvent;
      
      // Si presiona Shift, convertir scroll vertical a horizontal
      if (wheelEvent.shiftKey && wheelEvent.deltaY !== 0) {
        event.preventDefault();
        carousel.scrollBy({
          left: wheelEvent.deltaY,
          behavior: 'smooth'
        });
      }
      // Si hay scroll horizontal nativo (trackpad), usarlo
      else if (Math.abs(wheelEvent.deltaX) > Math.abs(wheelEvent.deltaY)) {
        event.preventDefault();
        carousel.scrollBy({
          left: wheelEvent.deltaX,
          behavior: 'smooth'
        });
      }
      // Sin Shift = scroll vertical normal de la página (no hacer nada)
    }, { passive: false });
  }

  verMas(producto: ProductoCarrusel): void {
    console.log('Ver más:', producto.nombre);
    // Aquí puedes agregar navegación o emitir evento
  }
}
