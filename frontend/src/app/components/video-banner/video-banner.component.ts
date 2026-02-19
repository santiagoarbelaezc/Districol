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

  @ViewChild('heroVideo', { static: true }) heroVideo!: ElementRef<HTMLVideoElement>;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    const video = this.heroVideo.nativeElement;
    
    this.showOverlay = false;
    this.cdr.detectChanges();

    if (!this.videoPlayAttempted) {
      this.videoPlayAttempted = true;
      
      video.play()
        .then(() => {
          console.log('Video reproduciéndose correctamente');
          
          this.showTimeout = setTimeout(() => {
            this.showOverlay = true;
            this.cdr.detectChanges();
            
            this.hideTimeout = setTimeout(() => {
              this.showOverlay = false;
              this.cdr.detectChanges();
            }, 5000);
            
          }, 5000);
          
        })
        .catch((error) => {
          console.log('Autoplay bloqueado:', error);
          this.showOverlay = true;
          this.cdr.detectChanges();
          
          setTimeout(() => {
            this.showOverlay = false;
            this.cdr.detectChanges();
          }, 10000);
        });
    }

    video.addEventListener('playing', () => {
      this.isPlaying = true;
      this.cdr.detectChanges();
    });

    video.addEventListener('pause', () => {
      this.isPlaying = false;
      this.cdr.detectChanges();
    });

    video.addEventListener('ended', () => {
      this.isPlaying = false;
      this.showOverlay = true;
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
