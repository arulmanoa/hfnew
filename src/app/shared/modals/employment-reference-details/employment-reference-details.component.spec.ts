import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmploymentReferenceDetailsComponent } from './employment-reference-details.component';

describe('EmploymentReferenceDetailsComponent', () => {
  let component: EmploymentReferenceDetailsComponent;
  let fixture: ComponentFixture<EmploymentReferenceDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmploymentReferenceDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmploymentReferenceDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
