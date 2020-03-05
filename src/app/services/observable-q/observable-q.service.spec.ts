import { TestBed } from '@angular/core/testing';

import { ObsevableQService } from './obsevable-q.service';

describe('ObsevableQService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ObsevableQService = TestBed.get(ObsevableQService);
    expect(service).toBeTruthy();
  });
});
