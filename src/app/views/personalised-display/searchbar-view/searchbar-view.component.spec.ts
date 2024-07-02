import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchbarViewComponent } from './searchbar-view.component';

describe('SearchbarViewComponent', () => {
  let component: SearchbarViewComponent;
  let fixture: ComponentFixture<SearchbarViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchbarViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchbarViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
