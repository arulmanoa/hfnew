import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollImportdataComponent } from './payroll-importdata.component';

describe('PayrollImportdataComponent', () => {
  let component: PayrollImportdataComponent;
  let fixture: ComponentFixture<PayrollImportdataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayrollImportdataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayrollImportdataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
