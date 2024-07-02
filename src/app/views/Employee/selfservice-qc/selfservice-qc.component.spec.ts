import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelfserviceQcComponent } from './selfservice-qc.component';

describe('SelfserviceQcComponent', () => {
  let component: SelfserviceQcComponent;
  let fixture: ComponentFixture<SelfserviceQcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelfserviceQcComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelfserviceQcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
