import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScaleModalComponent } from './scale-modal.component';

describe('ScaleModalComponent', () => {
  let component: ScaleModalComponent;
  let fixture: ComponentFixture<ScaleModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScaleModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScaleModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
