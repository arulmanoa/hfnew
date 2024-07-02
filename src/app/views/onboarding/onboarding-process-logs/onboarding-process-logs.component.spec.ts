import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingProcessLogsComponent } from './onboarding-process-logs.component';

describe('OnboardingProcessLogsComponent', () => {
  let component: OnboardingProcessLogsComponent;
  let fixture: ComponentFixture<OnboardingProcessLogsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OnboardingProcessLogsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnboardingProcessLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
