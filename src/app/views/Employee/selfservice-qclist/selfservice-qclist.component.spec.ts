import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelfserviceQclistComponent } from './selfservice-qclist.component';

describe('SelfserviceQclistComponent', () => {
  let component: SelfserviceQclistComponent;
  let fixture: ComponentFixture<SelfserviceQclistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelfserviceQclistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelfserviceQclistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
