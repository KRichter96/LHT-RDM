import { TestBed } from '@angular/core/testing';

import { ObservableQService } from './observable-q.service';

describe('ObservableQService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ObservableQService = TestBed.get(ObservableQService);
    expect(service).toBeTruthy();
  });
});
