import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserEndUiComponent } from './user-end-ui.component';

describe('UserEndUiComponent', () => {
  let component: UserEndUiComponent;
  let fixture: ComponentFixture<UserEndUiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserEndUiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserEndUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
