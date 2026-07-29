import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';

export interface LegalSection {
  id: string;
  titulo: string;
  subtitulo: string;
}

@Component({
  selector: 'app-legal',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './legal.component.html',
  styleUrls: ['./legal.component.css']
})
export class LegalComponent implements OnInit {
  activeSectionId: string = 'privacidad';

  sections: LegalSection[] = [
    {
      id: 'privacidad',
      titulo: 'Política y Privacidad',
      subtitulo: 'Tratamiento de Datos Personales (Ley 1581 de 2012)'
    },
    {
      id: 'terminos',
      titulo: 'Términos y Condiciones',
      subtitulo: 'Reglas de uso del sitio web y limitación de responsabilidades'
    },
    {
      id: 'cookies',
      titulo: 'Política de Cookies',
      subtitulo: 'Uso de tecnologías de almacenamiento y rastreo web'
    },
    {
      id: 'aviso-legal',
      titulo: 'Aviso Legal',
      subtitulo: 'Identificación titular y propiedad intelectual de Districol'
    },
    {
      id: 'pqrs',
      titulo: 'PQRS',
      subtitulo: 'Peticiones, Quejas, Reclamos y Sugerencias'
    }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['s'] && this.sections.some(s => s.id === params['s'])) {
        this.activeSectionId = params['s'];
      }
    });
  }

  setSection(id: string): void {
    this.activeSectionId = id;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get activeSection(): LegalSection {
    return this.sections.find(s => s.id === this.activeSectionId) || this.sections[0];
  }
}
