import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingQCComponent } from './onboarding-qc.component';

describe('OnboardingQCComponent', () => {
  let component: OnboardingQCComponent;
  let fixture: ComponentFixture<OnboardingQCComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OnboardingQCComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnboardingQCComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});