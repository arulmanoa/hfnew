import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveregularizeComponent } from './leaveregularize.component';

describe('LeaveregularizeComponent', () => {
  let component: LeaveregularizeComponent;
  let fixture: ComponentFixture<LeaveregularizeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeaveregularizeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaveregularizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
