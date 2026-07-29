import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface HeroSlideItem {
  img: string;
  img2: string;
  promoTag: string;
  title: string;
  subtitle: string;
  description: string;
  promoIcon: 'shipping' | 'discount' | 'gift';
  promoText: string;
  ctaText: string;
  link: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  currentSlide = 0;
  private autoSlideInterval: any;

  items: HeroSlideItem[] = [
    {
      img: 'assets/img/hero/banner1.jpg',
      img2: 'assets/img/alcoba1.jpg',
      promoTag: 'COLECCIÓN COLCHONES & DESCANSO',
      title: 'SUEÑO PREMIUM',
      subtitle: 'Tecnología y salud postural para tu hogar.',
      description: 'Disfruta tus mañanas y noches con nuestros colchones ergonómicos ortopédicos de alta gama. Diseñados para abrazar tu tranquilidad y bienestar en familia.',
      promoIcon: 'shipping',
      promoText: 'Envío gratis a Armenia y todo el Eje Cafetero',
      ctaText: 'VER COLCHONES',
      link: '/productos'
    },
    {
      img: 'assets/img/hero/banner2.jpg',
      img2: 'assets/img/agata.jpg',
      promoTag: 'LÍNEA DE LUJO & ÁGATA',
      title: 'CONFORT EXCLUSIVO',
      subtitle: 'Elegancia y soporte estructural de vanguardia.',
      description: 'Inspirada en la sofisticación de materiales nobles, telas de punto acolchadas y tecnología de termorregulación continua para un descanso inigualable.',
      promoIcon: 'discount',
      promoText: 'Hasta 30% OFF en combos con Base Cama',
      ctaText: 'VER COLECCIÓN',
      link: '/productos'
    },
    {
      img: 'assets/img/hero/banner3.jpg',
      img2: 'assets/img/alcoba2.jpg',
      promoTag: 'LENCERÍA & ACCESORIOS',
      title: 'ALGODÓN ORGÁNICO',
      subtitle: 'Sábanas, protectores e higiene para tu cama.',
      description: 'Completa tu experiencia de descanso con hilos 100% orgánicos certificados, protectores impermeables hipoalergénicos y almohadas anatómicas.',
      promoIcon: 'gift',
      promoText: 'Obsequio especial por compras de juego completo',
      ctaText: 'DESCUBRIR MÁS',
      link: '/productos'
    }
  ];

  ngOnInit(): void {
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  onScroll(): void {
    if (!this.scrollContainer) return;
    const el = this.scrollContainer.nativeElement;
    if (el.clientWidth > 0) {
      this.currentSlide = Math.round(el.scrollLeft / el.clientWidth);
    }
  }

  scrollToSlide(index: number): void {
    this.currentSlide = index;
    if (!this.scrollContainer) return;
    const el = this.scrollContainer.nativeElement;
    const slideWidth = el.clientWidth;
    el.scrollTo({
      left: index * slideWidth,
      behavior: 'smooth'
    });
  }

  prevSlide(): void {
    const prevIndex = (this.currentSlide - 1 + this.items.length) % this.items.length;
    this.scrollToSlide(prevIndex);
  }

  nextSlide(): void {
    const nextIndex = (this.currentSlide + 1) % this.items.length;
    this.scrollToSlide(nextIndex);
  }

  startAutoSlide(): void {
    this.stopAutoSlide();
    this.autoSlideInterval = setInterval(() => {
      const nextIndex = (this.currentSlide + 1) % this.items.length;
      this.scrollToSlide(nextIndex);
    }, 4000); // Reducido a 4 segundos para un cambio más fluido y dinámico
  }

  stopAutoSlide(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }
}