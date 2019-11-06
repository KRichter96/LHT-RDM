import { TestBed } from '@angular/core/testing';

import { LocalRepositoryService } from './localrepository.service';

describe('LocalRepositoryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LocalRepositoryService = TestBed.get(LocalRepositoryService);
    expect(service).toBeTruthy();
  });
});
