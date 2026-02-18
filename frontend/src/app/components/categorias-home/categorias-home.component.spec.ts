import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriasHomeComponent } from './categorias-home.component';

describe('CategoriasHomeComponent', () => {
  let component: CategoriasHomeComponent;
  let fixture: ComponentFixture<CategoriasHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriasHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoriasHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
