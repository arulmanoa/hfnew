import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeebulkattendanceModalComponent } from './employeebulkattendance-modal.component';

describe('EmployeebulkattendanceModalComponent', () => {
  let component: EmployeebulkattendanceModalComponent;
  let fixture: ComponentFixture<EmployeebulkattendanceModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeebulkattendanceModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeebulkattendanceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
