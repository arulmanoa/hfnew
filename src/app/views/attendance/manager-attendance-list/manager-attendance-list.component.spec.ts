import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerAttendanceListComponent } from './manager-attendance-list.component';

describe('ManagerAttendanceListComponent', () => {
  let component: ManagerAttendanceListComponent;
  let fixture: ComponentFixture<ManagerAttendanceListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManagerAttendanceListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagerAttendanceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
