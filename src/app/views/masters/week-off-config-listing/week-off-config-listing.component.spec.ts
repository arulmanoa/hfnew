import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekOffConfigListingComponent } from './week-off-config-listing.component';

describe('WeekOffConfigListingComponent', () => {
  let component: WeekOffConfigListingComponent;
  let fixture: ComponentFixture<WeekOffConfigListingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeekOffConfigListingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeekOffConfigListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
