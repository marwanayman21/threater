import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpRequest
} from '@angular/common/http';
import { JwtInterceptor } from './jwt.interceptor';
import { AuthService } from '../Service/auth.service';

describe('JwtInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: AuthService, useValue: {} }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('currentUser');
  });

  it('should add Authorization header if token exists', () => {
    const dummyToken = 'test-token-123';
    localStorage.setItem('currentUser', JSON.stringify({ token: dummyToken }));

    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');

    expect(req.request.headers.has('Authorization')).toBeTrue();
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${dummyToken}`);

    req.flush({});
  });

  it('should not add Authorization header if token is missing', () => {
    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');

    expect(req.request.headers.has('Authorization')).toBeFalse();

    req.flush({});
  });
});
