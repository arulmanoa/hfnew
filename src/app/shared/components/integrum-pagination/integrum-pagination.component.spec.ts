import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IntegrumPaginationComponent } from './integrum-pagination.component';

describe('IntegrumPaginationComponent', () => {
  let component: IntegrumPaginationComponent;
  let fixture: ComponentFixture<IntegrumPaginationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IntegrumPaginationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntegrumPaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
