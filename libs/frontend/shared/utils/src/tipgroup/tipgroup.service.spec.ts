import { TestBed } from '@angular/core/testing';

import { TipgroupOverviewResponseDto } from '@tippapp/shared/data-access';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TipgroupService } from './tipgroup.service';
import { ENVIRONMENT } from '../environments/environment.token';

describe('TipgroupService', () => {
  let service: TipgroupService;
  let httpTesting: HttpTestingController;

  const environmentMock = {
    apiUrl: 'testURL',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ENVIRONMENT,
          useValue: environmentMock,
        },
      ],
    });
    service = TestBed.inject(TipgroupService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send a GET-Request to get a list of Tipgroups', () => {
    const mockResponse: TipgroupOverviewResponseDto[] = [
      {
        id: 1,
        name: 'testgroup1',
        currentSeasonId: 1,
      },
      { id: 2, name: 'testgroup2', currentSeasonId: 2 },
    ];

    service.getAvailableTipgroups().subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpTesting.expectOne(`${service.BACKEND_URL}user/tipgroups`);
    expect(req.request.method).toBe('GET');

    req.flush(mockResponse);
  });
});
