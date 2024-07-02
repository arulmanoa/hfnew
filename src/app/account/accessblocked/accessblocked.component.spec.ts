import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessblockedComponent } from './accessblocked.component';

describe('AccessblockedComponent', () => {
  let component: AccessblockedComponent;
  let fixture: ComponentFixture<AccessblockedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccessblockedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessblockedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
