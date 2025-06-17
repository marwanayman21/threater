import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayDetailsPage2Component } from './play-details-page2.component';

describe('PlayDetailsPage2Component', () => {
  let component: PlayDetailsPage2Component;
  let fixture: ComponentFixture<PlayDetailsPage2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayDetailsPage2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayDetailsPage2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
