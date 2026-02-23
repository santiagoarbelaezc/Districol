import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './partners.component.html',
  styleUrl: './partners.component.css'
})
export class PartnersComponent {
  aliados = [
    {
      nombre: 'Espumas Medellín',
      logo: 'assets/logo/logo-espumas-med.png'
    },
    {
      nombre: 'Rivera',
      logo: 'assets/logo/logo-rivera.png'
    },
    {
      nombre: 'Santa Fe',
      logo: 'assets/logo/logo-santafe.png'
    }
  ];
}
