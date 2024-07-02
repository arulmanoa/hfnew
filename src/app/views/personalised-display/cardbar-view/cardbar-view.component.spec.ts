import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardbarViewComponent } from './cardbar-view.component';

describe('CardbarViewComponent', () => {
  let component: CardbarViewComponent;
  let fixture: ComponentFixture<CardbarViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardbarViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardbarViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
