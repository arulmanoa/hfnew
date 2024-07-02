import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamleaverequestComponent } from './teamleaverequest.component';

describe('TeamleaverequestComponent', () => {
  let component: TeamleaverequestComponent;
  let fixture: ComponentFixture<TeamleaverequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamleaverequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamleaverequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
