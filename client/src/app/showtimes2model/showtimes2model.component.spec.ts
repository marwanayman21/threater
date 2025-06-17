import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Showtimes2modelComponent } from './showtimes2model.component';

describe('Showtimes2modelComponent', () => {
  let component: Showtimes2modelComponent;
  let fixture: ComponentFixture<Showtimes2modelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Showtimes2modelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Showtimes2modelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
