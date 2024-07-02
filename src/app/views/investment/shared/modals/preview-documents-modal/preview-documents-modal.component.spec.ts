import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewDocumentsModalComponent } from './preview-documents-modal.component';

describe('PreviewDocumentsModalComponent', () => {
  let component: PreviewDocumentsModalComponent;
  let fixture: ComponentFixture<PreviewDocumentsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviewDocumentsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewDocumentsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
