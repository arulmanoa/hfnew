import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekOffListingComponent } from './week-off-listing.component';

describe('WeekOffListingComponent', () => {
  let component: WeekOffListingComponent;
  let fixture: ComponentFixture<WeekOffListingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeekOffListingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeekOffListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
