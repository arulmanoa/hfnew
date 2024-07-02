import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LifecycleQcComponent } from './lifecycle-qc.component';

describe('LifecycleQcComponent', () => {
  let component: LifecycleQcComponent;
  let fixture: ComponentFixture<LifecycleQcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LifecycleQcComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LifecycleQcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
