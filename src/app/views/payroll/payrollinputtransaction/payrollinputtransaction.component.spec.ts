import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollinputtransactionComponent } from './payrollinputtransaction.component';

describe('PayrollinputtransactionComponent', () => {
  let component: PayrollinputtransactionComponent;
  let fixture: ComponentFixture<PayrollinputtransactionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayrollinputtransactionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayrollinputtransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
