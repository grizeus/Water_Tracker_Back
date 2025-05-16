import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isValidId } from './isValidId.js';
import { isValidObjectId } from 'mongoose';

// Mock mongoose's isValidObjectId
vi.mock('mongoose', () => ({
  isValidObjectId: vi.fn(),
}));

describe('isValidId Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
    vi.clearAllMocks();
    // Reset the mock implementation for each test
    isValidObjectId.mockReset();
  });

  it('should call next() when ID is a valid MongoDB ObjectId', () => {
    const validObjectId = '507f1f77bcf86cd799439011';
    req.params.id = validObjectId;
    isValidObjectId.mockReturnValue(true);

    isValidId(req, res, next);

    expect(isValidObjectId).toHaveBeenCalledWith(validObjectId);
    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(); // No arguments means no error
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should call next with 400 error when ID is not a valid MongoDB ObjectId', () => {
    const invalidId = 'invalid-id';
    req.params.id = invalidId;
    isValidObjectId.mockReturnValue(false);

    isValidId(req, res, next);

    expect(isValidObjectId).toHaveBeenCalledWith(invalidId);
    expect(next).toHaveBeenCalled();

    // Check if next was called with an error that has status 400 and the correct message
    const error = next.mock.calls[0][0];
    expect(error).toBeDefined();
    expect(error.status).toBe(400);
    expect(error.message).toBe('Invalid ID format');

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should handle missing ID parameter', () => {
    // No ID in params
    isValidObjectId.mockReturnValue(false);

    isValidId(req, res, next);

    expect(isValidObjectId).toHaveBeenCalledWith(undefined);
    expect(next).toHaveBeenCalled();

    const error = next.mock.calls[0][0];
    expect(error).toBeDefined();
    expect(error.status).toBe(400);
    expect(error.message).toBe('Invalid ID format');
  });
});
