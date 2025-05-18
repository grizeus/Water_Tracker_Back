import { describe, it, expect, vi, beforeEach } from 'vitest';
import { errorHandler } from './errorHandler.js';
import createHttpError from 'http-errors';

describe('errorHandler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      method: 'GET',
      originalUrl: '/api/test',
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  it('should handle HttpError with status and message', () => {
    const error = createHttpError(404, 'Not Found');

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      message: 'NotFoundError',
      data: expect.objectContaining({
        status: 404,
        message: 'Not Found',
      }),
    });
  });

  it('should handle custom error with status and message', () => {
    const error = new Error('Custom error');
    error.status = 400;

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 400,
      message: 'Custom error',
    });
  });

  it('should use 500 as default status for unknown errors', () => {
    const error = new Error('Something went wrong');

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 500,
      message: 'Something went wrong',
    });
  });

  it('should handle error without status but with statusCode', () => {
    const error = new Error('Payment required');
    error.statusCode = 402;

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(402);
    expect(res.json).toHaveBeenCalledWith({
      status: 402,
      message: 'Payment required',
    });
  });
});
