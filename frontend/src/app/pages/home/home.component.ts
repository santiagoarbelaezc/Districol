import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { CarruselColchonesComponent } from '../../components/carrusel-home/carrusel-colchones/carrusel-colchones.component';
import { CarruselAlmohadasComponent } from '../../components/carrusel-home/carrusel-almohadas/carrusel-almohadas.component';
import { CardHomeComponent } from '../../components/card-home/card-home.component';
import { AlmohadaVideoComponent } from '../../components/almohada-video/almohada-video.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { PartnersComponent } from '../../components/partners/partners.component';
import { AosService } from '../../services/aos.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NavbarComponent,
    HeaderComponent,
    CarruselColchonesComponent,
    CarruselAlmohadasComponent,
    CardHomeComponent,
    AlmohadaVideoComponent,
    PartnersComponent,
    FooterComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  constructor(private aosService: AosService) { }

  ngOnInit(): void {
    this.aosService.init();
  }
}
