import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatesModalComponent } from './states-modal.component';

describe('StatesModalComponent', () => {
  let component: StatesModalComponent;
  let fixture: ComponentFixture<StatesModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatesModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
