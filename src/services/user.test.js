import { expect, it, vi, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { getUserById, updateUser, updateAvatar } from './user.js';
import UserCollections from '../db/models/User.js';

vi.mock('../db/models/User.js');

beforeEach(() => {
  vi.clearAllMocks();
});

it('should return user when valid userId is provided', async () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockUser = {
      _id: mockUserId,
      email: 'test@example.com',
      name: 'Test User'
    };

    UserCollections.findById.mockResolvedValue(mockUser);

    const result = await getUserById(mockUserId);
    expect(result).toEqual(mockUser);
    expect(UserCollections.findById).toHaveBeenCalledWith(mockUserId);
});

it('should throw error when user is not found', async () => {
    const mockUserId = new mongoose.Types.ObjectId();

    UserCollections.findOne.mockResolvedValue(null);

    await expect(
      updateUser(mockUserId, { name: 'New Name' })
    ).rejects.toThrow('User not found');
});

it('should update user details without password change', async () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const existingUser = {
      _id: mockUserId,
      email: 'test@example.com',
      name: 'Old Name',
      password: 'hashedpassword'
    };
    const updatedUser = {
      ...existingUser,
      name: 'New Name'
    };

    UserCollections.findOne.mockResolvedValue(existingUser);
    UserCollections.findOneAndUpdate.mockResolvedValue(updatedUser);

    const result = await updateUser(mockUserId, { name: 'New Name' });

    expect(UserCollections.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: mockUserId },
      { $set: { name: 'New Name' } },
      { new: true }
    );
    expect(result).toEqual(updatedUser);
});

it('should update user password when old and new passwords are provided', async () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const existingUser = {
      _id: mockUserId,
      email: 'test@example.com',
      password: await bcrypt.hash('oldpassword', 10)
    };
    const updatedUser = { ...existingUser };

    UserCollections.findOne.mockResolvedValue(existingUser);
    UserCollections.findOneAndUpdate.mockResolvedValue(updatedUser);

    const result = await updateUser(mockUserId, {
      oldPassword: 'oldpassword',
      newPassword: 'newpassword'
    });

    expect(UserCollections.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: mockUserId },
      expect.objectContaining({ $set: expect.any(Object) }),
      { new: true }
    );
    expect(result).toEqual(updatedUser);
});

it('should throw error when old password is incorrect', async () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const existingUser = {
      _id: mockUserId,
      email: 'test@example.com',
      password: await bcrypt.hash('oldpassword', 10)
    };

    UserCollections.findOne.mockResolvedValue(existingUser);

    await expect(
      updateUser(mockUserId, {
        oldPassword: 'wrongpassword',
        newPassword: 'newpassword'
      })
    ).rejects.toThrow('Old password is incorrect');
});

it('should update user avatar URL', async () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const newAvatarURL = 'https://example.com/new-avatar.jpg';
    const updatedUser = {
      _id: mockUserId,
      avatarURL: newAvatarURL
    };

    UserCollections.findOneAndUpdate.mockResolvedValue(updatedUser);

    const result = await updateAvatar(mockUserId, newAvatarURL);

    expect(UserCollections.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: mockUserId },
      { $set: { avatarURL: newAvatarURL } },
      { new: true }
    );
    expect(result).toEqual(updatedUser);
});
