import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftListingComponent } from './shift-listing.component';

describe('ShiftListingComponent', () => {
  let component: ShiftListingComponent;
  let fixture: ComponentFixture<ShiftListingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShiftListingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShiftListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
