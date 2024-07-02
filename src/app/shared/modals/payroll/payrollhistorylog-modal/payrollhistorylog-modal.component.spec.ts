import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollhistorylogModalComponent } from './payrollhistorylog-modal.component';

describe('PayrollhistorylogModalComponent', () => {
  let component: PayrollhistorylogModalComponent;
  let fixture: ComponentFixture<PayrollhistorylogModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayrollhistorylogModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayrollhistorylogModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
