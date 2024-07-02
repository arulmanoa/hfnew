import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceMonthlyReportComponent } from './attendance-monthly-report.component';

describe('AttendanceMonthlyReportComponent', () => {
  let component: AttendanceMonthlyReportComponent;
  let fixture: ComponentFixture<AttendanceMonthlyReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttendanceMonthlyReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttendanceMonthlyReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
