import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExemptionQcComponent } from './exemption-qc.component';

describe('ExemptionQcComponent', () => {
  let component: ExemptionQcComponent;
  let fixture: ComponentFixture<ExemptionQcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExemptionQcComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExemptionQcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
