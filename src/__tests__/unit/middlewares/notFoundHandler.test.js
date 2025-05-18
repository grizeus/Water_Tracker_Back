import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notFoundHandler } from '../../../middlewares/notFoundHandler.js';

describe('notFoundHandler Middleware', () => {
  let req, res;

  beforeEach(() => {
    req = {
      method: 'GET',
      url: '/api/non-existent-route',
      originalUrl: '/api/non-existent-route',
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    vi.clearAllMocks();
  });

  it('should return 404 status with correct message', () => {
    notFoundHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: '/api/non-existent-route not found',
    });
  });

  it('should handle empty URL', () => {
    req.url = '';
    req.originalUrl = '';

    notFoundHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: ' not found',
    });
  });

  it('should handle root URL', () => {
    req.url = '/';
    req.originalUrl = '/';

    notFoundHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: '/ not found',
    });
  });
});
