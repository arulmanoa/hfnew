import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddemployeeModalComponent } from './addemployee-modal.component';

describe('AddemployeeModalComponent', () => {
  let component: AddemployeeModalComponent;
  let fixture: ComponentFixture<AddemployeeModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddemployeeModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddemployeeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
