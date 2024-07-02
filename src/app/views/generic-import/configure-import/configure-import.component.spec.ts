import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureImportComponent } from './configure-import.component';

describe('ConfigureImportComponent', () => {
  let component: ConfigureImportComponent;
  let fixture: ComponentFixture<ConfigureImportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigureImportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigureImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
