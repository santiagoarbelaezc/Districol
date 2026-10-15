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
  slug?: string;
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
      const hasHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      const rawDelta = hasHorizontal ? e.deltaX : e.deltaY;

      if (Math.abs(rawDelta) < 0.5) return;

      const maxScroll = carousel.scrollWidth - carousel.clientWidth;
      if (maxScroll <= 0) return;

      const atStart = carousel.scrollLeft <= 1 && rawDelta < 0;
      const atEnd = carousel.scrollLeft >= maxScroll - 1 && rawDelta > 0;

      if (!atStart && !atEnd) {
        e.preventDefault();

        if (!this.isWheelScrolling) {
          this.targetScrollLeft = carousel.scrollLeft;
        }

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
      this.startX = e.pageX;
      this.startScrollLeft = carousel.scrollLeft;
      this.targetScrollLeft = carousel.scrollLeft;
    };
    carousel.addEventListener('mousedown', this.mouseDownListener);

    this.mouseMoveListener = (e: MouseEvent) => {
      if (!this.isDragging) return;

      const diff = e.pageX - this.startX;

      // Umbral generoso de 8px para que los clics normales jamás se consideren arrastres
      if (Math.abs(diff) > 8) {
        this.hasDragged = true;
        carousel.classList.add('is-dragging');
        carousel.scrollLeft = this.startScrollLeft - diff;
      }
    };
    window.addEventListener('mousemove', this.mouseMoveListener);

    this.mouseUpListener = () => {
      if (this.isDragging) {
        this.isDragging = false;
        carousel.classList.remove('is-dragging');
        if (this.hasDragged) {
          setTimeout(() => {
            this.hasDragged = false;
          }, 80);
        }
      }
    };
    window.addEventListener('mouseup', this.mouseUpListener);

    this.mouseLeaveListener = () => {
      if (this.isDragging) {
        this.isDragging = false;
        carousel.classList.remove('is-dragging');
        this.hasDragged = false;
      }
    };
    carousel.addEventListener('mouseleave', this.mouseLeaveListener);
  }

  private renderWheelAnimation(carousel: HTMLElement): void {
    const step = () => {
      const current = carousel.scrollLeft;
      const diff = this.targetScrollLeft - current;

      if (Math.abs(diff) > 0.8) {
        carousel.scrollLeft += diff * 0.18; // Inercia suave
        this.animFrameId = requestAnimationFrame(step);
      } else {
        carousel.scrollLeft = this.targetScrollLeft;
        this.isWheelScrolling = false;
        this.animFrameId = null;
      }
    };
    this.animFrameId = requestAnimationFrame(step);
  }

  verMas(producto: ProductoCarrusel, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    // Si el usuario estaba arrastrando con el ratón, ignorar
    if (this.hasDragged) {
      return;
    }
    const slug = producto.slug || getProductSlug(producto.id, producto.nombre);
    window.scrollTo({ top: 0, behavior: 'instant' });
    this.router.navigate(['/productos', slug]);
  }

  formatPrecio(precio?: number): string {
    if (!precio) return '';
    return '$ ' + precio.toLocaleString('es-CO');
  }
}
