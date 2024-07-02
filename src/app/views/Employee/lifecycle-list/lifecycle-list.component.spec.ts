import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LifecycleListComponent } from './lifecycle-list.component';

describe('LifecycleListComponent', () => {
  let component: LifecycleListComponent;
  let fixture: ComponentFixture<LifecycleListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LifecycleListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LifecycleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
