import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadBillingSheetModalComponent } from './download-billing-sheet-modal.component';

describe('DownloadBillingSheetModalComponent', () => {
  let component: DownloadBillingSheetModalComponent;
  let fixture: ComponentFixture<DownloadBillingSheetModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DownloadBillingSheetModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadBillingSheetModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
