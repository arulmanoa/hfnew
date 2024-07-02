import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorQcComponent } from './vendor-qc.component';

describe('VendorQcComponent', () => {
  let component: VendorQcComponent;
  let fixture: ComponentFixture<VendorQcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VendorQcComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorQcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
