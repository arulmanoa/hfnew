import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinalsettlementComponent } from './finalsettlement.component';

describe('FinalsettlementComponent', () => {
  let component: FinalsettlementComponent;
  let fixture: ComponentFixture<FinalsettlementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinalsettlementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinalsettlementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
