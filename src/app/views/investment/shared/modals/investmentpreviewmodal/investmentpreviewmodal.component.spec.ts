import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestmentpreviewmodalComponent } from './investmentpreviewmodal.component';

describe('InvestmentpreviewmodalComponent', () => {
  let component: InvestmentpreviewmodalComponent;
  let fixture: ComponentFixture<InvestmentpreviewmodalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvestmentpreviewmodalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestmentpreviewmodalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
