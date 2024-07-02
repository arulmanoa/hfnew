import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeMyRequestsUiComponent } from './employee-myrequests-ui.component';

describe('EmployeeMyRequestsUiComponent', () => {
  let component: EmployeeMyRequestsUiComponent;
  let fixture: ComponentFixture<EmployeeMyRequestsUiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeMyRequestsUiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeMyRequestsUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
