import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureImportInputModalComponent } from './configure-import-input-modal.component';

describe('ConfigureImportInputModalComponent', () => {
  let component: ConfigureImportInputModalComponent;
  let fixture: ComponentFixture<ConfigureImportInputModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigureImportInputModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigureImportInputModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
