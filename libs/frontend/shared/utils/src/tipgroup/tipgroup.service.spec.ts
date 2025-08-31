import {TestBed} from '@angular/core/testing';

import {TipgroupService} from './tipgroup.service';

describe('TipgroupService', () => {
  let service: TipgroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TipgroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
