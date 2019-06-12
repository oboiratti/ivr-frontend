import { TestBed } from '@angular/core/testing';

import { ReportFilterService } from './report-filter.service';

describe('ReportFilterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ReportFilterService = TestBed.get(ReportFilterService);
    expect(service).toBeTruthy();
  });
});
