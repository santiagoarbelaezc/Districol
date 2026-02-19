import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarruselHomeComponent } from './carrusel-home.component';

describe('CarruselHomeComponent', () => {
  let component: CarruselHomeComponent;
  let fixture: ComponentFixture<CarruselHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarruselHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarruselHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
