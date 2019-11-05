import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartDetailPage } from './part-detail.page';

describe('PartDetailPage', () => {
  let component: PartDetailPage;
  let fixture: ComponentFixture<PartDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartDetailPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
