import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeDeductionsComponent } from './employee-deductions.component';

describe('SalaryDetailsComponent', () => {
  let component: EmployeeDeductionsComponent;
  let fixture: ComponentFixture<EmployeeDeductionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeDeductionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeDeductionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
