import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  registerController,
  loginController,
  refreshTokenController,
  logoutController,
} from './auth.js';
import { refreshTokenLifeTime } from '../constants/auth.js';
import * as authService from '../services/auth.js';

vi.mock('../services/auth.js');

describe('Auth Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      cookies: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      cookie: vi.fn(),
      clearCookie: vi.fn(),
      send: vi.fn(),
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe('registerController', () => {
    it('should register a new user and return 201 status with access token', async () => {
      const mockToken = 'test-access-token';
      authService.registerUser.mockResolvedValue({ accessToken: mockToken });
      req.body = { email: 'test@example.com', password: 'password' };

      await registerController(req, res, next);

      expect(authService.registerUser).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 201,
        message: 'Successfully registered a user!',
        data: { accessToken: mockToken },
      });
    });

    it('should handle registration error', async () => {
      const error = new Error('Registration failed');
      authService.registerUser.mockRejectedValue(error);
      req.body = { email: 'test@example.com', password: 'password' };

      await expect(registerController(req, res, next)).rejects.toThrow(error);
    });
  });

  describe('loginController', () => {
    it('should login user and set cookies', async () => {
      const mockSession = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        id: 'session-id',
        refreshTokenValidUntil: new Date(Date.now() + refreshTokenLifeTime),
      };
      authService.loginUser.mockResolvedValue(mockSession);
      req.body = { email: 'test@example.com', password: 'password' };

      await loginController(req, res, next);

      expect(authService.loginUser).toHaveBeenCalledWith(req.body);
      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        mockSession.refreshToken,
        {
          httpOnly: true,
          expires: mockSession.refreshTokenValidUntil,
        },
      );
      expect(res.cookie).toHaveBeenCalledWith('sessionId', mockSession.id, {
        httpOnly: true,
        expires: mockSession.refreshTokenValidUntil,
      });
      expect(res.json).toHaveBeenCalledWith({
        status: 200,
        message: 'Successfully logged in a user!',
        data: { accessToken: mockSession.accessToken },
      });
    });

    it('should handle login error', async () => {
      const error = new Error('Login failed');
      authService.loginUser.mockRejectedValue(error);
      req.body = { email: 'test@example.com', password: 'wrong-password' };

      await expect(loginController(req, res, next)).rejects.toThrow(error);
    });
  });

  describe('refreshTokenController', () => {
    it('should refresh tokens and update cookies', async () => {
      const mockSession = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        id: 'new-session-id',
        refreshTokenValidUntil: new Date(Date.now() + refreshTokenLifeTime),
      };
      authService.refresh.mockResolvedValue(mockSession);
      req.cookies = {
        sessionId: 'old-session-id',
        refreshToken: 'old-refresh-token',
      };

      await refreshTokenController(req, res, next);

      expect(authService.refresh).toHaveBeenCalledWith({
        sessionId: 'old-session-id',
        refreshToken: 'old-refresh-token',
      });
      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        mockSession.refreshToken,
        {
          httpOnly: true,
          expires: mockSession.refreshTokenValidUntil,
        },
      );
      expect(res.cookie).toHaveBeenCalledWith('sessionId', mockSession.id, {
        httpOnly: true,
        expires: mockSession.refreshTokenValidUntil,
      });
      expect(res.json).toHaveBeenCalledWith({
        status: 200,
        message: 'Successfully refreshed a session!',
        data: { accessToken: mockSession.accessToken },
      });
    });

    it('should handle refresh error', async () => {
      const error = new Error('Refresh failed');
      authService.refresh.mockRejectedValue(error);
      req.cookies = { sessionId: 'invalid-session' };

      await expect(refreshTokenController(req, res, next)).rejects.toThrow(error);
    });
  });

  describe('logoutController', () => {
    it('should clear session and cookies', async () => {
      req.cookies = { sessionId: 'valid-session-id' };
      authService.logout.mockResolvedValue(true);

      await logoutController(req, res, next);

      expect(authService.logout).toHaveBeenCalledWith('valid-session-id');
      expect(res.clearCookie).toHaveBeenCalledWith('sessionId');
      expect(res.clearCookie).toHaveBeenCalledWith('refreshToken');
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should work even without session cookie', async () => {
      req.cookies = {};

      await logoutController(req, res, next);

      expect(authService.logout).not.toHaveBeenCalled();
      expect(res.clearCookie).toHaveBeenCalledWith('sessionId');
      expect(res.clearCookie).toHaveBeenCalledWith('refreshToken');
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });
});
