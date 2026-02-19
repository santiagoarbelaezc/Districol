import { Component, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements AfterViewInit, OnDestroy {
  showOverlay = false;
  isPlaying = false;
  private showTimeout: any;
  private hideTimeout: any;
  private videoPlayAttempted = false;

  @ViewChild('heroVideo', { static: true }) heroVideo!: ElementRef<HTMLVideoElement>;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    const video = this.heroVideo.nativeElement;
    
    // Asegurar que el overlay esté oculto al inicio
    this.showOverlay = false;
    this.cdr.detectChanges();

    // Intentar reproducir el video solo si no se ha intentado antes
    if (!this.videoPlayAttempted) {
      this.videoPlayAttempted = true;
      
      video.play()
        .then(() => {
          console.log('Video reproduciéndose correctamente');
          
          // Programar aparición del overlay después de 5 segundos
          this.showTimeout = setTimeout(() => {
            this.showOverlay = true;
            this.cdr.detectChanges();
            
            // Programar ocultamiento del overlay después de 10 segundos
            // (5 segundos adicionales después de aparecer)
            this.hideTimeout = setTimeout(() => {
              this.showOverlay = false;
              this.cdr.detectChanges();
            }, 5000); // 5 segundos visibles (total: 10 segundos desde carga)
            
          }, 5000); // Aparece a los 5 segundos
          
        })
        .catch((error) => {
          console.log('Autoplay bloqueado, mostrando overlay inmediatamente:', error);
          // Si el autoplay es bloqueado, mostrar el overlay como fallback
          this.showOverlay = true;
          this.cdr.detectChanges();
          
          // Aún así, programar ocultamiento después de 10 segundos totales
          setTimeout(() => {
            this.showOverlay = false;
            this.cdr.detectChanges();
          }, 10000);
        });
    }

    // Detectar cuando el video está reproduciéndose
    video.addEventListener('playing', () => {
      this.isPlaying = true;
      this.cdr.detectChanges();
    });

    // Detectar cuando el video se pausa o termina
    video.addEventListener('pause', () => {
      this.isPlaying = false;
      this.cdr.detectChanges();
    });

    video.addEventListener('ended', () => {
      this.isPlaying = false;
      this.showOverlay = true; // Mostrar overlay cuando termine el video
      this.clearTimeouts();
      this.cdr.detectChanges();
    });
  }

  playVideo() {
    const video = this.heroVideo.nativeElement;
    video.currentTime = 0;
    video.play().then(() => {
      this.isPlaying = true;
      this.showOverlay = false;
      this.clearTimeouts();
      
      // Programar overlay
      this.showTimeout = setTimeout(() => {
        this.showOverlay = true;
        this.cdr.detectChanges();
        
        this.hideTimeout = setTimeout(() => {
          this.showOverlay = false;
          this.cdr.detectChanges();
        }, 5000);
      }, 5000);
      
      this.cdr.detectChanges();
    }).catch(err => console.log('Error al reproducir:', err));
  }

  ngOnDestroy() {
    this.clearTimeouts();
  }

  private clearTimeouts() {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
    }
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
  }
}