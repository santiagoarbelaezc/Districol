import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarruselAlmohadasComponent } from './carrusel-almohadas.component';

describe('CarruselAlmohadasComponent', () => {
  let component: CarruselAlmohadasComponent;
  let fixture: ComponentFixture<CarruselAlmohadasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarruselAlmohadasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarruselAlmohadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
