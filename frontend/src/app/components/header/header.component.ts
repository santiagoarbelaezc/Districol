import { Component } from '@angular/core';
import { VideoBannerComponent } from '../video-banner/video-banner.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [VideoBannerComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {}