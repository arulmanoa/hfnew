import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorklocationModalComponent } from './worklocation-modal.component';

describe('WorklocationModalComponent', () => {
  let component: WorklocationModalComponent;
  let fixture: ComponentFixture<WorklocationModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorklocationModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorklocationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
