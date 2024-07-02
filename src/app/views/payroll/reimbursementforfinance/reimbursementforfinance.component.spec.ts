import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReimbursementforfinanceComponent } from './reimbursementforfinance.component';

describe('ReimbursementforfinanceComponent', () => {
  let component: ReimbursementforfinanceComponent;
  let fixture: ComponentFixture<ReimbursementforfinanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReimbursementforfinanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReimbursementforfinanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
