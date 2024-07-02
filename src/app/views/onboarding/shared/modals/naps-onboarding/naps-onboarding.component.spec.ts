import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NapsOnboardingComponent } from './naps-onboarding.component';

describe('NapsOnboardingComponent', () => {
  let component: NapsOnboardingComponent;
  let fixture: ComponentFixture<NapsOnboardingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NapsOnboardingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NapsOnboardingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
