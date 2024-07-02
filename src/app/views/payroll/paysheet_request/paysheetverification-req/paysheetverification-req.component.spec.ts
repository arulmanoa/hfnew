import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaysheetverificationReqComponent } from './paysheetverification-req.component';

describe('PaysheetverificationReqComponent', () => {
  let component: PaysheetverificationReqComponent;
  let fixture: ComponentFixture<PaysheetverificationReqComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaysheetverificationReqComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaysheetverificationReqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
