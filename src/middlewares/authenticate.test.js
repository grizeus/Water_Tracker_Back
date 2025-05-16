import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authenticate } from './authenticate.js';
import * as authService from '../services/auth.js';

vi.mock('../services/auth.js');

describe('Authentication Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      user: null,
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  it('should call next with 401 error when authorization header is missing', async () => {
    await authenticate(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 401,
        message: 'Headers not found.',
      })
    );
  });

  it('should call next with 401 error when authorization header is not Bearer type', async () => {
    req.headers.authorization = 'Basic token123';

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 401,
        message: 'Header must be Bearer type.',
      })
    );
  });

  it('should call next with 401 error when session is not found', async () => {
    req.headers.authorization = 'Bearer valid-token';
    authService.getSession.mockResolvedValue(null);

    await authenticate(req, res, next);

    expect(authService.getSession).toHaveBeenCalledWith({ accessToken: 'valid-token' });
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 401,
        message: 'Session not found.',
      })
    );
  });

  it('should call next with 401 error when access token is expired', async () => {
    req.headers.authorization = 'Bearer valid-token';
    const expiredSession = {
      accessTokenValidUntil: Date.now() - 1000, // Token expired 1 second ago
      userId: 'user123',
    };
    authService.getSession.mockResolvedValue(expiredSession);

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 401,
        message: 'Access token expired.',
      })
    );
  });

  it('should call next with 401 error when user is not found', async () => {
    req.headers.authorization = 'Bearer valid-token';
    const validSession = {
      accessTokenValidUntil: Date.now() + 3600000, // Token valid for 1 hour
      userId: 'user123',
    };
    authService.getSession.mockResolvedValue(validSession);
    authService.getUser.mockResolvedValue(null);

    await authenticate(req, res, next);

    expect(authService.getUser).toHaveBeenCalledWith({ _id: 'user123' });
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 401,
        message: 'Not found user.',
      })
    );
  });

  it('should set user on request and call next when authentication is successful', async () => {
    req.headers.authorization = 'Bearer valid-token';
    const validSession = {
      accessTokenValidUntil: Date.now() + 3600000, // Token valid for 1 hour
      userId: 'user123',
    };
    const mockUser = {
      _id: 'user123',
      email: 'test@example.com',
    };
    authService.getSession.mockResolvedValue(validSession);
    authService.getUser.mockResolvedValue(mockUser);

    await authenticate(req, res, next);

    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalledWith(); // Called with no arguments
  });
});
