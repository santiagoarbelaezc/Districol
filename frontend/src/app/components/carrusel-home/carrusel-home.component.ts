import { Component, Input, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { getProductSlug } from '../../utils/seo-slug.util';

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
export class CarruselHomeComponent implements AfterViewInit, OnDestroy {

  @Input() productos: ProductoCarrusel[] = [];
  @Input() titulo: string = '';
  @Input() tema: 'light' | 'dark' = 'light';
  @Input() carouselId: string = 'home';

  // Control de arrastre con mouse (Drag-to-scroll)
  private isDragging = false;
  private hasDragged = false;
  private startX = 0;
  private startScrollLeft = 0;

  // Control de scroll suave con rueda (Wheel momentum accumulator)
  private targetScrollLeft = 0;
  private isWheelScrolling = false;
  private animFrameId: number | null = null;
  private wheelListener?: (e: WheelEvent) => void;
  private mouseDownListener?: (e: MouseEvent) => void;
  private mouseMoveListener?: (e: MouseEvent) => void;
  private mouseUpListener?: () => void;
  private mouseLeaveListener?: () => void;

  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    this.initHorizontalMouseScroll();
  }

  ngOnDestroy(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    const carousel = document.getElementById(`carousel-${this.carouselId}`);
    if (carousel) {
      if (this.wheelListener) carousel.removeEventListener('wheel', this.wheelListener);
      if (this.mouseDownListener) carousel.removeEventListener('mousedown', this.mouseDownListener);
      if (this.mouseLeaveListener) carousel.removeEventListener('mouseleave', this.mouseLeaveListener);
    }
    if (this.mouseMoveListener) window.removeEventListener('mousemove', this.mouseMoveListener);
    if (this.mouseUpListener) window.removeEventListener('mouseup', this.mouseUpListener);
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

  private initHorizontalMouseScroll(): void {
    const carousel = document.getElementById(`carousel-${this.carouselId}`);
    if (!carousel) return;

    // ── 1. Desplazamiento Horizontal con Rueda del Mouse ──
    this.wheelListener = (e: WheelEvent) => {
      // Determinamos el delta: Soporta rueda vertical estándar, rueda con Shift y rueda/trackpad horizontal
      const hasHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      const rawDelta = hasHorizontal ? e.deltaX : e.deltaY;

      if (Math.abs(rawDelta) < 0.5) return;

      const maxScroll = carousel.scrollWidth - carousel.clientWidth;
      if (maxScroll <= 0) return;

      // Verificar si el carrusel aún tiene contenido para avanzar o retroceder
      const atStart = carousel.scrollLeft <= 1 && rawDelta < 0;
      const atEnd = carousel.scrollLeft >= maxScroll - 1 && rawDelta > 0;

      // Si no está en el extremo, interceptamos para que el giro del mouse desplace horizontalmente
      if (!atStart && !atEnd) {
        e.preventDefault();

        if (!this.isWheelScrolling) {
          this.targetScrollLeft = carousel.scrollLeft;
        }

        // Sensibilidad calibrada para fluidez máxima sin saltos
        const sensitivity = Math.abs(rawDelta) > 100 ? 1.3 : 1.7;
        this.targetScrollLeft += rawDelta * sensitivity;
        this.targetScrollLeft = Math.max(0, Math.min(this.targetScrollLeft, maxScroll));

        if (!this.isWheelScrolling) {
          this.isWheelScrolling = true;
          this.renderWheelAnimation(carousel);
        }
      }
    };
    carousel.addEventListener('wheel', this.wheelListener, { passive: false });

    // ── 2. Arrastre Horizontal Click & Drag con el Ratón ──
    this.mouseDownListener = (e: MouseEvent) => {
      // Solo botón primario (izquierdo)
      if (e.button !== 0) return;

      this.isDragging = true;
      this.hasDragged = false;
      this.startX = e.pageX - carousel.offsetLeft;
      this.startScrollLeft = carousel.scrollLeft;
      this.targetScrollLeft = carousel.scrollLeft;

      carousel.classList.add('is-dragging');
    };
    carousel.addEventListener('mousedown', this.mouseDownListener);

    this.mouseMoveListener = (e: MouseEvent) => {
      if (!this.isDragging) return;

      const x = e.pageX - carousel.offsetLeft;
      const walk = (x - this.startX) * 1.5;

      if (Math.abs(walk) > 4) {
        this.hasDragged = true;
      }

      carousel.scrollLeft = this.startScrollLeft - walk;
    };
    window.addEventListener('mousemove', this.mouseMoveListener);

    this.mouseUpListener = () => {
      if (this.isDragging) {
        this.isDragging = false;
        carousel.classList.remove('is-dragging');
      }
    };
    window.addEventListener('mouseup', this.mouseUpListener);

    this.mouseLeaveListener = () => {
      if (this.isDragging) {
        this.isDragging = false;
        carousel.classList.remove('is-dragging');
      }
    };
    carousel.addEventListener('mouseleave', this.mouseLeaveListener);
  }

  private renderWheelAnimation(carousel: HTMLElement): void {
    const step = () => {
      const current = carousel.scrollLeft;
      const diff = this.targetScrollLeft - current;

      if (Math.abs(diff) > 0.8) {
        carousel.scrollLeft += diff * 0.18; // Inercia suave de resorte
        this.animFrameId = requestAnimationFrame(step);
      } else {
        carousel.scrollLeft = this.targetScrollLeft;
        this.isWheelScrolling = false;
        this.animFrameId = null;
      }
    };
    this.animFrameId = requestAnimationFrame(step);
  }

  verMas(producto: ProductoCarrusel): void {
    // Si el usuario estaba arrastrando con el ratón, ignorar el clic accidental
    if (this.hasDragged) {
      this.hasDragged = false;
      return;
    }
    const slug = getProductSlug(producto.id, producto.nombre);
    this.router.navigate(['/productos', slug]);
  }

  formatPrecio(precio?: number): string {
    if (!precio) return '';
    return '$ ' + precio.toLocaleString('es-CO');
  }
}
