import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AcademicModalComponent } from './academic-modal.component';

describe('AcademicModalComponent', () => {
  let component: AcademicModalComponent;
  let fixture: ComponentFixture<AcademicModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AcademicModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AcademicModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
