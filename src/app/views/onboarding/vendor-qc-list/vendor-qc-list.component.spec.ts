import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorQcListComponent } from './vendor-qc-list.component';

describe('VendorQcListComponent', () => {
  let component: VendorQcListComponent;
  let fixture: ComponentFixture<VendorQcListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VendorQcListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorQcListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
