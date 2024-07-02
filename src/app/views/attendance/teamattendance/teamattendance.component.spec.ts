import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamattendanceComponent } from './teamattendance.component';

describe('TeamattendanceComponent', () => {
  let component: TeamattendanceComponent;
  let fixture: ComponentFixture<TeamattendanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamattendanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamattendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
