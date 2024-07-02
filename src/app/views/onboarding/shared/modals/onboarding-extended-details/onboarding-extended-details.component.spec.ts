import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingExtendedDetailsComponent } from './onboarding-extended-details.component';

describe('OnboardingExtendedDetailsComponent', () => {
  let component: OnboardingExtendedDetailsComponent;
  let fixture: ComponentFixture<OnboardingExtendedDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OnboardingExtendedDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnboardingExtendedDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
