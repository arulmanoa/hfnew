import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NomineeModalComponent } from './nominee-modal.component';

describe('NomineeModalComponent', () => {
  let component: NomineeModalComponent;
  let fixture: ComponentFixture<NomineeModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NomineeModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NomineeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
