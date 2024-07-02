import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmploymentcontractSeparationComponent } from './employmentcontract-separation.component';

describe('EmploymentcontractSeparationComponent', () => {
  let component: EmploymentcontractSeparationComponent;
  let fixture: ComponentFixture<EmploymentcontractSeparationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmploymentcontractSeparationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmploymentcontractSeparationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
