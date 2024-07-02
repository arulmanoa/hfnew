import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidatebasicinformationComponent } from './candidatebasicinformation.component';

describe('CandidatebasicinformationComponent', () => {
  let component: CandidatebasicinformationComponent;
  let fixture: ComponentFixture<CandidatebasicinformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CandidatebasicinformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CandidatebasicinformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
