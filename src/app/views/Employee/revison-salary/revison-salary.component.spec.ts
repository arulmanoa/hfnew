import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RevisonSalaryComponent } from './revison-salary.component';

describe('RevisonSalaryComponent', () => {
  let component: RevisonSalaryComponent;
  let fixture: ComponentFixture<RevisonSalaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RevisonSalaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RevisonSalaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
