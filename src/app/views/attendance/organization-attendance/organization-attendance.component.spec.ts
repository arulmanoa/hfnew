import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationAttendanceComponent } from './organization-attendance.component';

describe('OrganizationAttendanceComponent', () => {
  let component: OrganizationAttendanceComponent;
  let fixture: ComponentFixture<OrganizationAttendanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationAttendanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
