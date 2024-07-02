import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddexpenseModalComponent } from './addexpense-modal.component';

describe('AddexpenseModalComponent', () => {
  let component: AddexpenseModalComponent;
  let fixture: ComponentFixture<AddexpenseModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddexpenseModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddexpenseModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
