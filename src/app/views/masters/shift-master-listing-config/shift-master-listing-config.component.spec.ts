import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftMasterListingConfigComponent } from './shift-master-listing-config.component';

describe('ShiftMasterListingConfigComponent', () => {
  let component: ShiftMasterListingConfigComponent;
  let fixture: ComponentFixture<ShiftMasterListingConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShiftMasterListingConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShiftMasterListingConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
