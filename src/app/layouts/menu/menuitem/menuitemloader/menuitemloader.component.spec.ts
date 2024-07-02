import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuitemloaderComponent } from './menuitemloader.component';

describe('MenuitemloaderComponent', () => {
  let component: MenuitemloaderComponent;
  let fixture: ComponentFixture<MenuitemloaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MenuitemloaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuitemloaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
