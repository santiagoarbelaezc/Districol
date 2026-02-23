import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { AlmohadaVideoComponent } from '../../components/almohada-video/almohada-video.component';
import { CarruselColchonesComponent } from '../../components/carrusel-home/carrusel-colchones/carrusel-colchones.component';
import { CarruselAlmohadasComponent } from '../../components/carrusel-home/carrusel-almohadas/carrusel-almohadas.component';
import { CardHomeComponent } from '../../components/card-home/card-home.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { PartnersComponent } from '../../components/partners/partners.component';
import { ProtectorHomeComponent } from '../../components/protector-home/protector-home.component';
import { AosService } from '../../services/aos.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent, HeaderComponent, AlmohadaVideoComponent, CarruselColchonesComponent, CarruselAlmohadasComponent, CardHomeComponent, PartnersComponent, ProtectorHomeComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  constructor(private aosService: AosService) { }

  ngOnInit(): void {
    this.aosService.init();
  }
}
