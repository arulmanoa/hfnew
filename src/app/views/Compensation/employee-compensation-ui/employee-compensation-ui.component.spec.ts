import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeCompensationUiComponent } from './employee-compensation-ui.component';

describe('EmployeeCompensationUiComponent', () => {
  let component: EmployeeCompensationUiComponent;
  let fixture: ComponentFixture<EmployeeCompensationUiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeCompensationUiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeCompensationUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
