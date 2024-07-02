import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceentriesComponent } from './attendanceentries.component';

describe('AttendanceentriesComponent', () => {
  let component: AttendanceentriesComponent;
  let fixture: ComponentFixture<AttendanceentriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttendanceentriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttendanceentriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
