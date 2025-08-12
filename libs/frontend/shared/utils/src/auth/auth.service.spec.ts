import {TestBed} from '@angular/core/testing';

import {Router} from "@angular/router";
import {HttpTestingController, provideHttpClientTesting} from "@angular/common/http/testing";
import {provideHttpClient} from "@angular/common/http";
import {LoginDto, RegisterDto} from "@tippapp/shared/data-access";
import {AuthService} from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  const mockRouter = {
    navigate: jest.fn()
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: Router,
          useValue: mockRouter
        }
      ]
    });
    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send a POST-Request for Registration', () => {
    const mockRegisterDto: RegisterDto = {
      username: 'testuser',
      password: 'testpassword',
      email: 'test@example.com'
    };
    const mockResponse = {accessToken: '123'};

    service.registerNewUser(mockRegisterDto).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpTesting.expectOne(`${service.BACKEND_URL}auth/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockRegisterDto);
    expect(req.request.withCredentials).toBe(true);

    req.flush(mockResponse);
  });

  it('should send a POST-Request for login', () => {
    const mockLoginDto: LoginDto = {
      email: 'testuser@email.com',
      password: 'testpassword'
    };
    const mockResponse = {accessToken: '123'};

    service.loginUser(mockLoginDto).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpTesting.expectOne(`${service.BACKEND_URL}auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockLoginDto);
    expect(req.request.withCredentials).toBe(true);

    req.flush(mockResponse);
  });

  it('should send a POST-Request for refreshing the Access-Token', () => {
    const mockResponse = {accessToken: 'refreshed-token'};

    service.refreshAccessToken().subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpTesting.expectOne(`${service.BACKEND_URL}auth/refresh`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);

    req.flush(mockResponse);
  });

  it('should navigate to login-page', () => {
    service.logoutAndRedirect();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['auth/login']);
  });
});
