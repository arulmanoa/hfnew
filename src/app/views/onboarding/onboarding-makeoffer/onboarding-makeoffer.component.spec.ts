import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingMakeofferComponent } from './onboarding-makeoffer.component';

describe('OnboardingMakeofferComponent', () => {
  let component: OnboardingMakeofferComponent;
  let fixture: ComponentFixture<OnboardingMakeofferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OnboardingMakeofferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnboardingMakeofferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

