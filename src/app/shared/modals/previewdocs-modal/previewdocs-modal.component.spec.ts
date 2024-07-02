import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewdocsModalComponent } from './previewdocs-modal.component';

describe('PreviewdocsModalComponent', () => {
  let component: PreviewdocsModalComponent;
  let fixture: ComponentFixture<PreviewdocsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviewdocsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewdocsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
