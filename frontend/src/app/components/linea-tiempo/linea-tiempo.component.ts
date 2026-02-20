import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface EventoTimeline {
  anio: string;
  titulo: string;
  descripcion: string;
}

@Component({
  selector: 'app-linea-tiempo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './linea-tiempo.component.html',
  styleUrl: './linea-tiempo.component.css'
})
export class LineaTiempoComponent {
  eventos: EventoTimeline[] = [
    {
      anio: '2015',
      titulo: 'Nacimiento de Districol',
      descripcion: 'Iniciamos nuestra travesía con la visión de transformar el descanso de los colombianos, importando los mejores colchones del mundo.'
    },
    {
      anio: '2018',
      titulo: 'Centro de Experiencia',
      descripcion: 'Abrimos nuestro primer centro de experiencia en Armenia, donde cada cliente puede vivir la diferencia antes de comprar.'
    },
    {
      anio: '2020',
      titulo: 'Expansión Nacional',
      descripcion: 'Llevamos el mejor descanso a más hogares colombianos, expandiendo nuestra presencia a nivel nacional.'
    },
    {
      anio: '2023',
      titulo: 'Innovación Continua',
      descripcion: 'Incorporamos tecnología de punta en nuestros colchones: Memory Foam, sistemas Pocket y materiales eco-friendly.'
    },
    {
      anio: '2026',
      titulo: 'Líderes en Descanso',
      descripcion: 'Consolidados como referentes en colchones de alta gama, seguimos comprometidos con tu bienestar nocturno.'
    }
  ];
}
