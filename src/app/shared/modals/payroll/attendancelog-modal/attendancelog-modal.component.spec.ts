import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendancelogModalComponent } from './attendancelog-modal.component';

describe('AttendancelogModalComponent', () => {
  let component: AttendancelogModalComponent;
  let fixture: ComponentFixture<AttendancelogModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttendancelogModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttendancelogModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
