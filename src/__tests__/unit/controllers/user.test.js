import { describe, it, expect, vi, beforeEach } from 'vitest';
import createHttpError from 'http-errors';
import {
  getUserController,
  updateUserController,
  updateAvatarController,
} from '../../../controllers/user.js';
import * as userService from '../../../services/user.js';
import * as cloudinaryUtils from '../../../utils/saveFileToCloudinary.js';

vi.mock('../../../services/user.js');
vi.mock('../../../utils/saveFileToCloudinary.js');

describe('User Controller', () => {
  let req, res, next;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    name: 'Test User',
    gender: 'male',
    avatarURL: 'http://example.com/avatar.jpg',
    dailyGoal: 2000,
  };

  beforeEach(() => {
    req = {
      user: { _id: mockUser._id },
      body: {},
      file: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe('getUserController', () => {
    it('should return user data when user exists', async () => {
      userService.getUserById.mockResolvedValue(mockUser);

      const jsonMock = vi.fn();
      res = {
        ...res,
        json: jsonMock,
      };

      await getUserController(req, res, next);

      expect(userService.getUserById).toHaveBeenCalledWith(mockUser._id);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 200,
        message: 'Successfully found user!',
        data: {
          email: mockUser.email,
          gender: mockUser.gender,
          name: mockUser.name,
          avatarURL: mockUser.avatarURL,
          dailyGoal: mockUser.dailyGoal,
        },
      });
    });

    it('should return 404 when user is not found', async () => {
      userService.getUserById.mockResolvedValue(null);

      const result = await getUserController(req, res, next);

      expect(result).toBeInstanceOf(createHttpError.HttpError);
      expect(result.statusCode).toBe(404);
      expect(result.message).toBe('The request cannot be processed.');
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('updateUserController', () => {
    it('should update user data and return updated user', async () => {
      const updatedData = { name: 'Updated Name', dailyGoal: 2500 };
      const updatedUser = { ...mockUser, ...updatedData };

      userService.updateUser.mockResolvedValue(updatedUser);
      req.body = updatedData;

      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnThis();
      res = {
        ...res,
        json: jsonMock,
        status: statusMock,
      };

      await updateUserController(req, res, next);

      expect(userService.updateUser).toHaveBeenCalledWith(mockUser._id, updatedData);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 200,
        message: 'Successfully updated user',
        data: {
          email: updatedUser.email,
          gender: updatedUser.gender,
          name: updatedUser.name,
          avatarURL: updatedUser.avatarURL,
          dailyGoal: updatedUser.dailyGoal,
        },
      });
    });

    it('should return 404 when update fails', async () => {
      userService.updateUser.mockResolvedValue(null);
      req.body = { name: 'New Name' };

      const result = await updateUserController(req, res, next);

      expect(result).toBeInstanceOf(createHttpError.HttpError);
      expect(result.statusCode).toBe(404);
      expect(result.message).toBe('The request cannot be processed.');
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('updateAvatarController', () => {
    it('should update user avatar and return new URL', async () => {
      const mockFile = { path: 'test/path.jpg' };
      const newAvatarUrl = 'http://example.com/new-avatar.jpg';
      const updatedUser = { ...mockUser, avatarURL: newAvatarUrl };

      req.file = mockFile;
      cloudinaryUtils.saveFileToCloudinary.mockResolvedValue(newAvatarUrl);
      userService.updateAvatar.mockResolvedValue(updatedUser);

      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnThis();
      res = {
        ...res,
        json: jsonMock,
        status: statusMock,
      };

      await updateAvatarController(req, res, next);

      expect(cloudinaryUtils.saveFileToCloudinary).toHaveBeenCalledWith(mockFile);
      expect(userService.updateAvatar).toHaveBeenCalledWith(mockUser._id, newAvatarUrl);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 200,
        message: 'Successfully updated avatar',
        avatarURL: newAvatarUrl,
      });
    });

    it('should return 400 when no file is provided', async () => {
      req.file = null;

      await updateAvatarController(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(createHttpError.HttpError));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Avatar file is required');
    });

    it('should handle Cloudinary upload error', async () => {
      req.file = { path: 'test/path.jpg' };
      cloudinaryUtils.saveFileToCloudinary.mockRejectedValue(new Error('Upload failed'));

      await updateAvatarController(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(createHttpError.HttpError));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(503);
      expect(error.message).toBe(
        'There was an error connecting to an external service. Please try again later.'
      );
    });

    it('should handle update avatar failure', async () => {
      req.file = { path: 'test/path.jpg' };
      cloudinaryUtils.saveFileToCloudinary.mockResolvedValue('http://example.com/avatar.jpg');
      userService.updateAvatar.mockResolvedValue(null);

      await updateAvatarController(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(createHttpError.HttpError));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('The request cannot be processed.');
    });
  });
});
