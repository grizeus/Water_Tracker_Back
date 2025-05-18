import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateBody } from './validateBody.js';
import createHttpError from 'http-errors';

describe('validateBody Middleware', () => {
  let req, res, next, schema;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();

    schema = {
      validateAsync: vi.fn(),
    };

    vi.clearAllMocks();
  });

  it('should call next() when validation passes', async () => {
    const middleware = validateBody(schema);
    req.body = { name: 'Test', value: 123 };
    schema.validateAsync.mockResolvedValue(req.body);

    await middleware(req, res, next);

    expect(schema.validateAsync).toHaveBeenCalledWith(req.body, { abortEarly: false });
    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(); // No error
  });

  it('should call next with 400 error when validation fails', async () => {
    const middleware = validateBody(schema);
    const validationError = new Error('Validation error');
    validationError.details = [{ message: 'Name is required' }];
    schema.validateAsync.mockRejectedValue(validationError);

    await middleware(req, res, next);

    expect(schema.validateAsync).toHaveBeenCalledWith(req.body, { abortEarly: false });
    expect(next).toHaveBeenCalled();

    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(createHttpError.HttpError);
    expect(error.status).toBe(400);
    expect(error.message).toBe('Name is required');
  });

  it('should handle multiple validation errors', async () => {
    const middleware = validateBody(schema);
    const validationError = new Error('Validation error');
    validationError.details = [
      { message: 'Name is required' },
      { message: 'Email is invalid' },
    ];
    schema.validateAsync.mockRejectedValue(validationError);

    await middleware(req, res, next);

    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(createHttpError.HttpError);
    expect(error.status).toBe(400);
    // Should only show the first error message
    expect(error.message).toBe('Name is required');
  });

  it('should handle empty body when required', async () => {
    const middleware = validateBody(schema);
    const validationError = new Error('Validation error');
    validationError.details = [{ message: 'Request body is required' }];
    schema.validateAsync.mockRejectedValue(validationError);

    await middleware(req, res, next);

    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(createHttpError.HttpError);
    expect(error.status).toBe(400);
    expect(error.message).toBe('Request body is required');
  });
});
