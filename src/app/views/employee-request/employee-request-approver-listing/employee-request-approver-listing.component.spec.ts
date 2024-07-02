import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeRequestApproverListingComponent } from './employee-request-approver-listing.component';

describe('EmployeeRequestApproverListingComponent', () => {
  let component: EmployeeRequestApproverListingComponent;
  let fixture: ComponentFixture<EmployeeRequestApproverListingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeRequestApproverListingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeRequestApproverListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
