import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoBannerComponent } from '../video-banner/video-banner.component';
import { LineaTiempoComponent } from '../linea-tiempo/linea-tiempo.component';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';

@Component({
  selector: 'app-nosotros',
  standalone: true,
  imports: [CommonModule, VideoBannerComponent, LineaTiempoComponent, NavbarComponent, FooterComponent],
  templateUrl: './nosotros.component.html',
  styleUrl: './nosotros.component.css'
})
export class NosotrosComponent {

}
