import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoBannerComponent } from '../video-banner/video-banner.component';

@Component({
  selector: 'app-protector-home',
  standalone: true,
  imports: [CommonModule, VideoBannerComponent],
  templateUrl: './protector-home.component.html',
  styleUrl: './protector-home.component.css'
})
export class ProtectorHomeComponent { }
