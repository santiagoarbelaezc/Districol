import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-redes-sociales',
    imports: [CommonModule],
    templateUrl: './redes-sociales.component.html',
    styleUrls: ['./redes-sociales.component.css']
})
export class RedesSocialesComponent implements OnInit, OnDestroy {
  hoveredButton: string | null = null;
  showHelpMessage = false;
  isVisible = true;
  private helpMessageTimeout: any;
  private routerSub!: Subscription;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const ua = navigator.userAgent;
      if (/iPhone/.test(ua)) {
        document.body.classList.add('ios');
      } else if (/Android/.test(ua)) {
        document.body.classList.add('android');
      }
    }
  }

  ngOnInit(): void {
    // Escuchar cambios de ruta para ocultar en dashboard y producto
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      // Ajustar condiciones según las rutas reales para dashboard y descripción de producto
      if (url.includes('dashboard') || url.includes('producto')) {
        this.isVisible = false;
        this.showHelpMessage = false;
      } else {
        this.isVisible = true;
        // Solo mostramos el cajón flotante después de un tiempo si es visible
        if (!this.showHelpMessage) {
           this.scheduleHelpMessage();
        }
      }
    });

    if (isPlatformBrowser(this.platformId)) {
      this.scheduleHelpMessage();
    }
  }

  private scheduleHelpMessage() {
    this.helpMessageTimeout = setTimeout(() => {
      if (this.isVisible) {
        this.showHelpMessage = true;
      }
    }, 2000);
  }

  ngOnDestroy(): void {
    if (this.helpMessageTimeout) {
      clearTimeout(this.helpMessageTimeout);
    }
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  onMouseEnter(button: string): void {
    this.hoveredButton = button;
  }

  onMouseLeave(button: string): void {
    this.hoveredButton = null;
  }

  closeHelpMessage(): void {
    this.showHelpMessage = false;
  }
}
