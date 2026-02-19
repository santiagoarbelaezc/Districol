import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlmohadaVideoComponent } from './almohada-video.component';

describe('AlmohadaVideoComponent', () => {
  let component: AlmohadaVideoComponent;
  let fixture: ComponentFixture<AlmohadaVideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlmohadaVideoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlmohadaVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
