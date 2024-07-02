import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSuspensionmodalComponent } from './add-suspensionmodal.component';

describe('AddSuspensionmodalComponent', () => {
  let component: AddSuspensionmodalComponent;
  let fixture: ComponentFixture<AddSuspensionmodalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddSuspensionmodalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSuspensionmodalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
