import { Component, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-video-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-banner.component.html',
  styleUrl: './video-banner.component.css'
})
export class VideoBannerComponent implements AfterViewInit, OnDestroy {
  @Input() videoSrc: string = '';
  @Input() titulo: string = '';
  @Input() subtitulo: string = '';
  @Input() logoSrc: string = 'assets/img/logo-grande.png';

  showOverlay = false;
  isPlaying = false;
  private showTimeout: any;
  private hideTimeout: any;
  private videoPlayAttempted = false;
  private timeUpdateListener: any;
  private intersectionObserver: IntersectionObserver | undefined;

  @ViewChild('heroVideo', { static: true }) heroVideo!: ElementRef<HTMLVideoElement>;

  constructor(private cdr: ChangeDetectorRef) { }

  ngAfterViewInit() {
    const video = this.heroVideo.nativeElement;

    this.showOverlay = false;
    this.cdr.detectChanges();

    // Intersection Observer to pause/play based on visibility
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          video.play().catch(() => {
            // Might fail due to autoplay policy if user hasn't interacted
            this.showOverlay = true;
            this.cdr.detectChanges();
          });
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.2 }); // Trigger when at least 20% is visible

    this.intersectionObserver.observe(video);

    if (!this.videoPlayAttempted) {
      this.videoPlayAttempted = true;
      // Initial play attempt handled by observer usually, but keeping logic for robustness
    }

    video.addEventListener('playing', () => {
      this.isPlaying = true;
      this.cdr.detectChanges();
    });

    video.addEventListener('pause', () => {
      this.isPlaying = false;
      this.cdr.detectChanges();
    });

    // Para videos con loop: detectar cuando el video está por terminar un ciclo
    this.timeUpdateListener = () => {
      if (video.duration && video.currentTime >= video.duration - 0.5) {
        if (!this.showOverlay) {
          this.showOverlay = true;
          this.cdr.detectChanges();
        }
      }
    };
    video.addEventListener('timeupdate', this.timeUpdateListener);

    // Para videos sin loop
    video.addEventListener('ended', () => {
      this.isPlaying = false;
      this.showOverlay = true;
      this.clearTimeouts();
      this.cdr.detectChanges();
    });

    // Detectar cuando el video reinicia el loop (seeking al inicio)
    video.addEventListener('seeked', () => {
      if (video.currentTime < 1 && this.showOverlay) {
        // El video hizo loop: ocultar overlay después de 3 segundos
        this.hideTimeout = setTimeout(() => {
          this.showOverlay = false;
          this.cdr.detectChanges();
        }, 3000);
      }
    });
  }

  private scheduleOverlay(): void {
    this.clearTimeouts();

    // Mostrar overlay a los 5 segundos
    this.showTimeout = setTimeout(() => {
      this.showOverlay = true;
      this.cdr.detectChanges();

      // Ocultar a los 5 segundos
      this.hideTimeout = setTimeout(() => {
        this.showOverlay = false;
        this.cdr.detectChanges();
      }, 5000);

    }, 5000);
  }

  onVideoLoaded() {
    // Logic now primarily handled by the observer
  }

  playVideo() {
    const video = this.heroVideo.nativeElement;
    video.currentTime = 0;
    video.play().then(() => {
      this.isPlaying = true;
      this.showOverlay = false;
      this.clearTimeouts();
      this.scheduleOverlay();
      this.cdr.detectChanges();
    }).catch(err => console.log('Error al reproducir:', err));
  }

  ngOnDestroy() {
    this.clearTimeouts();
    const video = this.heroVideo?.nativeElement;
    if (video && this.timeUpdateListener) {
      video.removeEventListener('timeupdate', this.timeUpdateListener);
    }
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
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
