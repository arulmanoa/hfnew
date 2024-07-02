import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorOnboardingComponent } from './vendor-onboarding.component';

describe('VendorOnboardingComponent', () => {
  let component: VendorOnboardingComponent;
  let fixture: ComponentFixture<VendorOnboardingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VendorOnboardingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorOnboardingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
