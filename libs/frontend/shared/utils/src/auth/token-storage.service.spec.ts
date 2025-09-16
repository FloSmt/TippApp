import {TestBed} from '@angular/core/testing';
import {Platform} from "@ionic/angular";
import {Preferences} from "@capacitor/preferences";
import {TokenStorageService} from './token-storage.service';


jest.mock('@capacitor/preferences', () => ({
  Preferences: {
    set: jest.fn(),
    get: jest.fn(),
    remove: jest.fn(),
  },
}));

describe('TokenStorageService', () => {
  let service: TokenStorageService;

  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn()
  }

  const platformMock = {
    is: jest.fn()
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TokenStorageService,
        {provide: Platform, useValue: platformMock},
      ]
    });

    Object.defineProperty(window, 'localStorage', {value: localStorageMock});

    service = TestBed.inject(TokenStorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setRefreshToken', () => {
    it('should store the refresh token in localStorage if platform is not native', async () => {
      platformMock.is.mockReturnValue(false);
      await service.setRefreshToken('testToken');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('refreshToken', 'testToken');
    });

    it('should store the refresh token in preferences if platform is native', async () => {
      platformMock.is.mockReturnValue(true);
      await service.setRefreshToken('testToken');
      expect(Preferences.set).toHaveBeenCalledWith({key: 'refreshToken', value: 'testToken'});
    });
  });

  describe('getRefreshToken', () => {
    it('should return the refresh token from localStorage if platform is not native', async () => {
      localStorageMock.getItem.mockReturnValue('testToken');
      platformMock.is.mockReturnValue(false);

      const result = await service.getRefreshToken();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('refreshToken');
      expect(result).toBe('testToken');
    });

    it('should store the refresh token in preferences if platform is native', async () => {
      (Preferences.get as jest.Mock).mockReturnValue({value: 'testToken'});
      platformMock.is.mockReturnValue(true);

      const result = await service.getRefreshToken();

      expect(Preferences.get).toHaveBeenCalledWith({key: 'refreshToken'});
      expect(result).toBe('testToken');
    });
  });

  describe('clearTokens', () => {
    it('should remove the refresh token from localStorage if platform is not native', async () => {
      platformMock.is.mockReturnValue(false);
      await service.clearTokens();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refreshToken');
    });

    it('should remove the refresh token from preferences if platform is native', async () => {
      platformMock.is.mockReturnValue(true);
      await service.clearTokens();
      expect(Preferences.remove).toHaveBeenCalledWith({key: 'refreshToken'});
    });
  })
});
