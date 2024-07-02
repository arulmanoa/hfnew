import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AadhaarVerificationComponent } from './aadhaar-verification.component';

describe('AadhaarVerificationComponent', () => {
  let component: AadhaarVerificationComponent;
  let fixture: ComponentFixture<AadhaarVerificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AadhaarVerificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AadhaarVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
