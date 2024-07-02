import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeleaverequestModalComponent } from './employeeleaverequest-modal.component';

describe('EmployeeleaverequestModalComponent', () => {
  let component: EmployeeleaverequestModalComponent;
  let fixture: ComponentFixture<EmployeeleaverequestModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeleaverequestModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeleaverequestModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
