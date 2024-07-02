import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingOpsListComponent } from './onboarding-ops-list.component';

describe('OnboardingOpsListComponent', () => {
  let component: OnboardingOpsListComponent;
  let fixture: ComponentFixture<OnboardingOpsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OnboardingOpsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnboardingOpsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
