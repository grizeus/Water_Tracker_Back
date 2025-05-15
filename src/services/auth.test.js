import { createSessionData, registerUser, loginUser, refresh, logout } from './auth';
import UserCollections from '../db/models/User.js';
import SessionCollections from '../db/models/Session.js';
import mongoose from 'mongoose';
import { beforeEach, expect, it, vi } from 'vitest';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

vi.mock('../db/models/User.js');
vi.mock('../db/models/Session.js');

beforeEach(() => {
  vi.clearAllMocks();
});

it('createSessionData generates valid session data', () => {
  const sessionData = createSessionData();
  expect(sessionData).toHaveProperty('accessToken');
  expect(sessionData).toHaveProperty('refreshToken');
  expect(sessionData).toHaveProperty('accessTokenValidUntil');
  expect(sessionData).toHaveProperty('refreshTokenValidUntil');
  expect(sessionData.accessToken).toHaveLength(48);
  expect(sessionData.refreshToken).toHaveLength(48);
});

it('registerUser creates a new user and session', async () => {
  const mockUser = {
    _id: new mongoose.Types.ObjectId(),
    email: 'test@example.com',
    password: 'password',
  };
  UserCollections.create.mockResolvedValue(mockUser);
  SessionCollections.create.mockResolvedValue({ userId: mockUser._id });

  const payload = { email: 'test@example.com', password: 'password' };
  await registerUser(payload);

  expect(UserCollections.create).toHaveBeenCalledWith(
    expect.objectContaining({
      email: 'test@example.com',
      password: expect.any(String),
    }),
  );
  expect(SessionCollections.create).toHaveBeenCalledWith(
    expect.objectContaining({
      userId: mockUser._id,
    }),
  );
});

it('loginUser returns user data if credentials are correct', async () => {
  const mockUser = {
    _id: new mongoose.Types.ObjectId(),
    email: 'test@example.com',
    password: await bcrypt.hash('password', 10),
  };
  UserCollections.findOne.mockResolvedValue(mockUser);
  SessionCollections.create.mockResolvedValue({
    userId: mockUser._id,
    accessToken: randomBytes(35).toString('base64'),
    refreshToken: randomBytes(35).toString('base64'),
  });

  const credentials = { email: mockUser.email, password: 'password' };
  const mockLoginUser = await loginUser(credentials);

  expect(UserCollections.findOne).toHaveBeenCalledWith({
    email: 'test@example.com',
  });
  expect(UserCollections.findOne).toHaveBeenCalledTimes(1);
  expect(mockLoginUser).toHaveProperty('accessToken');
  expect(mockLoginUser).toHaveProperty('refreshToken');
  expect(mockLoginUser.accessToken).toHaveLength(48);
  expect(mockLoginUser.refreshToken).toHaveLength(48);
  expect(typeof mockLoginUser.accessToken).toBe('string');
  expect(typeof mockLoginUser.refreshToken).toBe('string');
});

it('loginUser throws error for non-existent user', async () => {
  UserCollections.findOne.mockResolvedValue(null);

  await expect(
    loginUser({ email: 'nonexistent@example.com', password: 'anypassword' }),
  ).rejects.toThrow('Invalid email or password!');
});

it('loginUser throws error for invalid credentials', async () => {
  const mockUser = {
    _id: new mongoose.Types.ObjectId(),
    email: 'test1@example.com',
    password: 'password',
  };
  UserCollections.findOne.mockResolvedValue(mockUser);

  await expect(
    loginUser({ email: 'test@example.com', password: 'password' }),
  ).rejects.toThrow('Invalid email or password!');
});

it('refresh function returns new session data for valid refresh token', async () => {
  const mockUserId = new mongoose.Types.ObjectId();
  const mockSession = {
    _id: new mongoose.Types.ObjectId(),
    userId: mockUserId,
    refreshToken: 'old-refresh-token',
    refreshTokenValidUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
  };

  SessionCollections.findOne.mockResolvedValue(mockSession);
  SessionCollections.deleteOne.mockResolvedValue({});
  SessionCollections.create.mockResolvedValue({
    userId: mockUserId,
    accessToken: 'new-access-token',
    refreshToken: 'new-refresh-token',
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
    refreshTokenValidUntil: new Date(Date.now() + 24 * 60 * 60 * 1000)
  });

  const result = await refresh({
    sessionId: mockSession._id,
    refreshToken: mockSession.refreshToken
  });

  expect(SessionCollections.findOne).toHaveBeenCalledWith({
    _id: mockSession._id,
    refreshToken: mockSession.refreshToken
  });
  expect(SessionCollections.deleteOne).toHaveBeenCalledWith({
    _id: mockSession._id,
    refreshToken: mockSession.refreshToken
  });
  expect(result).toHaveProperty('accessToken');
  expect(result).toHaveProperty('refreshToken');
  expect(result.userId).toEqual(mockUserId);
});

it('refresh function throws error for non-existent session', async () => {
  SessionCollections.findOne.mockResolvedValue(null);

  await expect(refresh({
    sessionId: 'non-existent-id',
    refreshToken: 'invalid-token'
  })).rejects.toThrow('Session not found');
});

it('refresh function throws error for expired refresh token', async () => {
  const mockSession = {
    _id: new mongoose.Types.ObjectId(),
    userId: new mongoose.Types.ObjectId(),
    refreshToken: 'old-refresh-token',
    refreshTokenValidUntil: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
  };

  SessionCollections.findOne.mockResolvedValue(mockSession);

  await expect(refresh({
    sessionId: mockSession._id,
    refreshToken: mockSession.refreshToken
  })).rejects.toThrow('Session token expired');
});

it('refresh function throws error when sessionId is null', async () => {
  await expect(refresh({
    sessionId: null,
    refreshToken: 'some-token'
  })).rejects.toThrow('Bad Request: Session ID or/and refresh token are invalid!');
});

it('refresh function throws error when refreshToken is null', async () => {
  await expect(refresh({
    sessionId: 'some-id',
    refreshToken: null
  })).rejects.toThrow('Bad Request: Session ID or/and refresh token are invalid!');
});

it('refresh function throws error when both sessionId and refreshToken are null', async () => {
  await expect(refresh({
    sessionId: null,
    refreshToken: null
  })).rejects.toThrow('Bad Request: Session ID or/and refresh token are invalid!');
});

it('should logout user', async () => {
  const mockSessionId = new mongoose.Types.ObjectId();

  await logout(mockSessionId);

  expect(SessionCollections.deleteOne).toHaveBeenCalledWith({ _id: mockSessionId });
});
