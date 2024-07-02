import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftMasterListingComponent } from './shift-master-listing.component';

describe('ShiftMasterListingComponent', () => {
  let component: ShiftMasterListingComponent;
  let fixture: ComponentFixture<ShiftMasterListingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShiftMasterListingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShiftMasterListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
