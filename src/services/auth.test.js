import { createSessionData, registerUser, loginUser } from './auth';
import UserCollections from '../db/models/User.js';
import SessionCollections from '../db/models/Session.js';
import mongoose from 'mongoose';
import { beforeEach, expect, it, vi } from 'vitest';
import bcrypt from 'bcrypt';

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

let mockRegisterUser;
let mockLoginUser;

it('registerUser creates a new user and session', async () => {
  const mockUser = {
    _id: new mongoose.Types.ObjectId(),
    email: 'test@example.com',
    password: 'password',
  };
  UserCollections.create.mockResolvedValue(mockUser);
  SessionCollections.create.mockResolvedValue({ userId: mockUser._id });

  const payload = { email: 'test@example.com', password: 'password' };
  mockRegisterUser = await registerUser(payload);

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
    email: 'test@example.com',
    password: await bcrypt.hash('password', 10),
  };
  UserCollections.findOne.mockResolvedValue(mockUser);

  const credentials = { email: mockUser.email, password: 'password' };
  mockLoginUser = await loginUser(credentials);

  console.log(mockLoginUser, mockRegisterUser);

  expect(UserCollections.findOne).toHaveBeenCalledWith({
    email: 'test@example.com',
  });
  expect(UserCollections.findOne).toHaveBeenCalledTimes(1);
  expect(mockLoginUser).toEqual(mockRegisterUser);
  expect(mockLoginUser).toHaveProperty('accessToken');
  expect(mockLoginUser).toHaveProperty('refreshToken');
});
