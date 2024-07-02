import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateAcceptanceComponent } from './candidate-acceptance.component';

describe('CandidateAcceptanceComponent', () => {
  let component: CandidateAcceptanceComponent;
  let fixture: ComponentFixture<CandidateAcceptanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CandidateAcceptanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CandidateAcceptanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
