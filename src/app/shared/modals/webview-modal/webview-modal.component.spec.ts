import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebviewModalComponent } from './webview-modal.component';

describe('WebviewModalComponent', () => {
  let component: WebviewModalComponent;
  let fixture: ComponentFixture<WebviewModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebviewModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebviewModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
