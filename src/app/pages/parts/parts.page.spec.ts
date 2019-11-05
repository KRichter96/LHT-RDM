import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartsPage } from './parts.page';

describe('PartsPage', () => {
  let component: PartsPage;
  let fixture: ComponentFixture<PartsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
