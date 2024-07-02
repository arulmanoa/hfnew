import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviousEmploymentModalComponent } from './previous-employment-modal.component';

describe('PreviousEmploymentModalComponent', () => {
  let component: PreviousEmploymentModalComponent;
  let fixture: ComponentFixture<PreviousEmploymentModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviousEmploymentModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviousEmploymentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
