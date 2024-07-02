import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LifecycleQclistComponent } from './lifecycle-qclist.component';

describe('LifecycleQclistComponent', () => {
  let component: LifecycleQclistComponent;
  let fixture: ComponentFixture<LifecycleQclistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LifecycleQclistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LifecycleQclistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
