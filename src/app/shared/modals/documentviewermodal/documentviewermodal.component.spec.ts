import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentviewermodalComponent } from './documentviewermodal.component';

describe('DocumentviewermodalComponent', () => {
  let component: DocumentviewermodalComponent;
  let fixture: ComponentFixture<DocumentviewermodalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentviewermodalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentviewermodalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
