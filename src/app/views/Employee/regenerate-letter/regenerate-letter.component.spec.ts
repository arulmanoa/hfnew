import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegenerateLetterComponent } from './regenerate-letter.component';

describe('RegenerateModalComponent', () => {
  let component: RegenerateLetterComponent;
  let fixture: ComponentFixture<RegenerateLetterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegenerateLetterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegenerateLetterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
