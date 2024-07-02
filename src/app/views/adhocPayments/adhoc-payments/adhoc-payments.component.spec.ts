import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdhocPaymentsComponent } from './adhoc-payments.component';

describe('AdhocPaymentsComponent', () => {
  let component: AdhocPaymentsComponent;
  let fixture: ComponentFixture<AdhocPaymentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdhocPaymentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdhocPaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
