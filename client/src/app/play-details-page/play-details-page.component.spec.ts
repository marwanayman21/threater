import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayDetailsPageComponent } from './play-details-page.component';

describe('PlayDetailsPageComponent', () => {
  let component: PlayDetailsPageComponent;
  let fixture: ComponentFixture<PlayDetailsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayDetailsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayDetailsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
