import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarruselColchonesComponent } from './carrusel-colchones.component';

describe('CarruselColchonesComponent', () => {
  let component: CarruselColchonesComponent;
  let fixture: ComponentFixture<CarruselColchonesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarruselColchonesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarruselColchonesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
