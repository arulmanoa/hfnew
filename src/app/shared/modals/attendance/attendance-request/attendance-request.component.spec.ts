import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceRequestComponent } from './attendance-request.component';

describe('AttendanceRequestComponent', () => {
  let component: AttendanceRequestComponent;
  let fixture: ComponentFixture<AttendanceRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttendanceRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttendanceRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
