import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateOTPComponent } from './candidate-otp.component';

describe('CandidateOTPComponent', () => {
  let component: CandidateOTPComponent;
  let fixture: ComponentFixture<CandidateOTPComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CandidateOTPComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CandidateOTPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
