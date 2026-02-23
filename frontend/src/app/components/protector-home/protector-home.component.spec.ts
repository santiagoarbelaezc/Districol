import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtectorHomeComponent } from './protector-home.component';

describe('ProtectorHomeComponent', () => {
  let component: ProtectorHomeComponent;
  let fixture: ComponentFixture<ProtectorHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProtectorHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProtectorHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
