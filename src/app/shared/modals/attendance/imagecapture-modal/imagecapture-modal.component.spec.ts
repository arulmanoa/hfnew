import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagecaptureModalComponent } from './imagecapture-modal.component';

describe('ImagecaptureModalComponent', () => {
  let component: ImagecaptureModalComponent;
  let fixture: ComponentFixture<ImagecaptureModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImagecaptureModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImagecaptureModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
