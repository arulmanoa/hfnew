import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxslipComponent } from './taxslip.component';

describe('TaxslipComponent', () => {
  let component: TaxslipComponent;
  let fixture: ComponentFixture<TaxslipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxslipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxslipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
