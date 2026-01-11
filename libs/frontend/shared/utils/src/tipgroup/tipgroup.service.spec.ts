import { TestBed } from '@angular/core/testing';

import { CreateTipgroupDto, TipgroupOverviewResponseDto } from '@tippapp/shared/data-access';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TipgroupService } from './tipgroup.service';
import { ENVIRONMENT } from '../environments/environment.token';

describe('TipgroupService', () => {
  let service: TipgroupService;
  let httpTesting: HttpTestingController;

  const environmentMock = {
    apiUrl: 'testURL/',
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

    const req = httpTesting.expectOne(`${service.BACKEND_URL}tipgroups`);
    expect(req.request.method).toBe('GET');

    req.flush(mockResponse);
  });

  it('should send a GET-Request to get a list of available Leagues', () => {
    service.getAvailableLeagues().subscribe((response) => {
      expect(response).toEqual('testResponse');
    });

    const req = httpTesting.expectOne(`${service.BACKEND_URL}tipgroups/getAvailableLeagues`);
    expect(req.request.method).toBe('GET');

    req.flush('testResponse');
  });

  it('should send a GET-Request to get a details of a tipgroup', () => {
    service.getTipgroupDetails(1).subscribe((response) => {
      expect(response).toEqual('testResponse');
    });

    const req = httpTesting.expectOne(`${service.BACKEND_URL}tipgroups/1`);
    expect(req.request.method).toBe('GET');

    req.flush('testResponse');
  });

  it('should send a GET-Request to get matchday details of a matchday', () => {
    service.getMatchdayDetails(1, 1, 1).subscribe((response) => {
      expect(response).toEqual('testResponse');
    });

    const req = httpTesting.expectOne(`${service.BACKEND_URL}tipgroups/1/seasons/1/matchdays/1`);
    expect(req.request.method).toBe('GET');

    req.flush('testResponse');
  });

  it('should send a GET-Request to get current matchday', () => {
    service.getCurrentMatchdayDetails(1, 1).subscribe((response) => {
      expect(response).toEqual('testResponse');
    });

    const req = httpTesting.expectOne(`${service.BACKEND_URL}tipgroups/1/seasons/1/getCurrentMatchday`);
    expect(req.request.method).toBe('GET');

    req.flush('testResponse');
  });

  it('should send a GET-Request to get a list of all matchdays', () => {
    service.getMatchdayOverview(1, 1).subscribe((response) => {
      expect(response).toEqual('testResponse');
    });

    const req = httpTesting.expectOne(`${service.BACKEND_URL}tipgroups/1/seasons/1/getAllMatchdays`);
    expect(req.request.method).toBe('GET');

    req.flush('testResponse');
  });

  it('should send a POST-Request to create a Tipgroup', () => {
    const mockRequestBody: CreateTipgroupDto = {
      name: 'testTipgroup',
      password: 'testPassword',
      leagueShortcut: 'bl1',
      currentSeason: 2024,
    };

    service.createTipgroup(mockRequestBody).subscribe((response) => {
      expect(response).toEqual('testResponse');
    });

    const req = httpTesting.expectOne(`${service.BACKEND_URL}tipgroups`);
    expect(req.request.body).toEqual(mockRequestBody);
    expect(req.request.method).toBe('POST');

    req.flush('testResponse');
  });
});
