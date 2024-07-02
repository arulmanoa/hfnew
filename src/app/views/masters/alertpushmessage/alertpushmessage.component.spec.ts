import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertpushmessageComponent } from './alertpushmessage.component';

describe('AlertpushmessageComponent', () => {
  let component: AlertpushmessageComponent;
  let fixture: ComponentFixture<AlertpushmessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlertpushmessageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertpushmessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
