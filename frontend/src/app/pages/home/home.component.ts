import { Component } from '@angular/core';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { AlmohadaVideoComponent } from '../../components/almohada-video/almohada-video.component';
import { CarruselColchonesComponent } from '../../components/carrusel-home/carrusel-colchones/carrusel-colchones.component';
import { CardHomeComponent } from '../../components/card-home/card-home.component';
import { FooterComponent } from '../../shared/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent, HeaderComponent, AlmohadaVideoComponent, CarruselColchonesComponent, CardHomeComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
