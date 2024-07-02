import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewCtcModalComponent } from './preview-ctc-modal.component';

describe('PreviewCtcModalComponent', () => {
  let component: PreviewCtcModalComponent;
  let fixture: ComponentFixture<PreviewCtcModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviewCtcModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewCtcModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
