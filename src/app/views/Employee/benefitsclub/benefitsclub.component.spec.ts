import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BenefitsclubComponent } from './benefitsclub.component';

describe('BenefitsclubComponent', () => {
  let component: BenefitsclubComponent;
  let fixture: ComponentFixture<BenefitsclubComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BenefitsclubComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BenefitsclubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
