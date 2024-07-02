import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestmentpreviewComponent } from './investmentpreview.component';

describe('InvestmentpreviewComponent', () => {
  let component: InvestmentpreviewComponent;
  let fixture: ComponentFixture<InvestmentpreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvestmentpreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestmentpreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
