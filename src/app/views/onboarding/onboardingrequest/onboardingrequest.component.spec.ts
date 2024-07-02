import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingrequestComponent } from './onboardingrequest.component';

describe('OnboardingrequestComponent', () => {
  let component: OnboardingrequestComponent;
  let fixture: ComponentFixture<OnboardingrequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OnboardingrequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnboardingrequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
