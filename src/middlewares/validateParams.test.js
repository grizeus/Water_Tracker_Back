import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateParams } from './validateParams.js';
import createHttpError from 'http-errors';

describe('validateParams Middleware', () => {
  let req, res, next, schema;

  beforeEach(() => {
    req = {
      params: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
    
    // Mock schema with validateAsync method
    schema = {
      validateAsync: vi.fn(),
    };
    
    vi.clearAllMocks();
  });

  it('should call next() when params validation passes', async () => {
    const middleware = validateParams(schema);
    req.params = { id: '507f1f77bcf86cd799439011' };
    schema.validateAsync.mockResolvedValue(req.params);

    await middleware(req, res, next);

    expect(schema.validateAsync).toHaveBeenCalledWith(req.params, { abortEarly: false });
    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(); // No error
  });

  it('should call next with 400 error when params validation fails', async () => {
    const middleware = validateParams(schema);
    const validationError = new Error('Validation error');
    validationError.details = [{ message: 'Invalid ID format' }];
    schema.validateAsync.mockRejectedValue(validationError);

    await middleware(req, res, next);

    expect(schema.validateAsync).toHaveBeenCalledWith(req.params, { abortEarly: false });
    expect(next).toHaveBeenCalled();
    
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(createHttpError.HttpError);
    expect(error.status).toBe(400);
    expect(error.message).toBe('Invalid ID format');
  });

  it('should handle empty params object', async () => {
    const middleware = validateParams(schema);
    const validationError = new Error('Validation error');
    validationError.details = [{ message: 'ID is required' }];
    schema.validateAsync.mockRejectedValue(validationError);

    await middleware(req, res, next);

    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(createHttpError.HttpError);
    expect(error.status).toBe(400);
    expect(error.message).toBe('ID is required');
  });

  it('should handle multiple validation errors', async () => {
    const middleware = validateParams(schema);
    const validationError = new Error('Validation error');
    validationError.details = [
      { message: 'ID is required' },
      { message: 'Invalid format' },
    ];
    schema.validateAsync.mockRejectedValue(validationError);

    await middleware(req, res, next);

    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(createHttpError.HttpError);
    expect(error.status).toBe(400);
    // Should only show the first error message
    expect(error.message).toBe('ID is required');
  });
});
