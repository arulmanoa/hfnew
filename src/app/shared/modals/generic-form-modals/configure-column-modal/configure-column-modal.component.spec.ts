import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureColumnModalComponent } from './configure-column-modal.component';

describe('ConfigureColumnModalComponent', () => {
  let component: ConfigureColumnModalComponent;
  let fixture: ComponentFixture<ConfigureColumnModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigureColumnModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigureColumnModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
