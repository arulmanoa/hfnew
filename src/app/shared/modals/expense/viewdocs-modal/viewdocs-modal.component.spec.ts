import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewdocsModalComponent } from './viewdocs-modal.component';

describe('ViewdocsModalComponent', () => {
  let component: ViewdocsModalComponent;
  let fixture: ComponentFixture<ViewdocsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewdocsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewdocsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
