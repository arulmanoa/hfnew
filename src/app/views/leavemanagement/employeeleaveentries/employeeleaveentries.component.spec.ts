import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeleaveentriesComponent } from './employeeleaveentries.component';

describe('EmployeeleaveentriesComponent', () => {
  let component: EmployeeleaveentriesComponent;
  let fixture: ComponentFixture<EmployeeleaveentriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeleaveentriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeleaveentriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
