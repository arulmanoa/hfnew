import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewOnboardingProcessLogsComponent } from './view-onboarding-process-logs.component';

describe('ViewOnboardingProcessLogsComponent', () => {
  let component: ViewOnboardingProcessLogsComponent;
  let fixture: ComponentFixture<ViewOnboardingProcessLogsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewOnboardingProcessLogsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewOnboardingProcessLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
