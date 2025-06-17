import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowtimesModalComponent } from './showtimes-modal.component';

describe('ShowtimesModalComponent', () => {
  let component: ShowtimesModalComponent;
  let fixture: ComponentFixture<ShowtimesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowtimesModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowtimesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
