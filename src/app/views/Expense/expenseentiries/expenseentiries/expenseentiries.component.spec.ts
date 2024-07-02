import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseentiriesComponent } from './expenseentiries.component';

describe('ExpenseentiriesComponent', () => {
  let component: ExpenseentiriesComponent;
  let fixture: ComponentFixture<ExpenseentiriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpenseentiriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpenseentiriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
