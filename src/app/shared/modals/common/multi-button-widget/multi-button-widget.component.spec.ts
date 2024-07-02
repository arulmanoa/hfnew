import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiButtonWidgetComponent } from './multi-button-widget.component';

describe('MultiButtonWidgetComponent', () => {
  let component: MultiButtonWidgetComponent;
  let fixture: ComponentFixture<MultiButtonWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiButtonWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiButtonWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
