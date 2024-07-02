import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeReportListComponent } from './employee-report-list.component';

describe('EmployeeReportListComponent', () => {
  let component: EmployeeReportListComponent;
  let fixture: ComponentFixture<EmployeeReportListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeReportListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeReportListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
