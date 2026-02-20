import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DescripcionSelectComponent } from './descripcion-select.component';

describe('DescripcionSelectComponent', () => {
  let component: DescripcionSelectComponent;
  let fixture: ComponentFixture<DescripcionSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DescripcionSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DescripcionSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
