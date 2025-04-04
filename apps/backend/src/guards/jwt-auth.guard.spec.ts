import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ExecutionContext } from '@nestjs/common';

describe('JwtAuthGuard', () => {
  let jwtAuthGuard: JwtAuthGuard;
  let jwtService: JwtService;
  let reflector: Reflector;
  let configService: ConfigService;

  beforeEach(() => {
    jwtService = new JwtService(null);
    reflector = new Reflector();
    configService = new ConfigService();

    jwtAuthGuard = new JwtAuthGuard(jwtService, reflector, configService);
  });

  it('should allow access if route is marked as public', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    const result = await jwtAuthGuard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException if no token is present', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    const mockRequest = { headers: {} };
    const context = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    await expect(jwtAuthGuard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if token is invalid', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new Error('Invalid token'));

    const mockRequest = { headers: { authorization: 'Bearer invalid-token' } };
    const context = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    await expect(jwtAuthGuard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should allow access if token is valid', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    jest.spyOn(configService, 'get').mockReturnValue('mock-secret');
    jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({ id: 1, email: 'test@example.com' });

    const mockRequest = { headers: { authorization: 'Bearer valid-token' } };
    const context = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    const result = await jwtAuthGuard.canActivate(context);
    expect(result).toBe(true);
    expect(mockRequest['user']).toEqual({ id: 1, email: 'test@example.com' });
  });
});
