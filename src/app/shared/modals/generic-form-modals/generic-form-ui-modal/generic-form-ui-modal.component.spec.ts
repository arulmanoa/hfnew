import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericFormUiModalComponent } from './generic-form-ui-modal.component';

describe('GenericFormUiModalComponent', () => {
  let component: GenericFormUiModalComponent;
  let fixture: ComponentFixture<GenericFormUiModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenericFormUiModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericFormUiModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
