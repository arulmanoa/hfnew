import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileDownloadNewComponent } from './file-download-new.component';

describe('FileDownloadNewComponent', () => {
  let component: FileDownloadNewComponent;
  let fixture: ComponentFixture<FileDownloadNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileDownloadNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileDownloadNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
