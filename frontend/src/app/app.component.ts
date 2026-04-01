import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AosService } from './services/aos.service';
import { ScrollService } from './services/scroll.service';

import { RedesSocialesComponent } from './shared/redes-sociales/redes-sociales.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RedesSocialesComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'frontend';

  constructor(
    private aosService: AosService,
    private scrollService: ScrollService
  ) { }

  ngOnInit(): void {
    this.aosService.init();
    this.scrollService.init();
  }
}
