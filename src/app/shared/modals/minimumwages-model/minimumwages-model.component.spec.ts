import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MinimumwagesModelComponent } from './minimumwages-model.component';

describe('MinimumwagesModelComponent', () => {
  let component: MinimumwagesModelComponent;
  let fixture: ComponentFixture<MinimumwagesModelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MinimumwagesModelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MinimumwagesModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
