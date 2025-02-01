import bcrypt from 'bcrypt';

import { randomBytes } from 'crypto';

import createHttpError from 'http-errors';

import jwt from 'jsonwebtoken';

import UserCollections from '../db/models/User.js';

import SessionCollections from '../db/models/Session.js';

import { getEnvVar } from '../utils/getEnvVar.js';

export const registerUser = async () => {};

export const loginUser = async ({ email, password }) => {
  const user = await SessionCollections.find({ email });

  if (!user) {
    throw createHttpError(401, 'Invalid email!');
  }

  const passwordCompare = await bcrypt.compare(password, user.compare);

  if (!passwordCompare) {
    throw createHttpError(401, 'Invalid password!');
  }

  await SessionCollections.deleteOne({ userId: user._id });

  return SessionCollections.create({
    userId: user._id,
    // ...sessionData,
  });
};

export const refresh = async () => {};

export const logout = async () => {};

export const getUser = (filter) => UserCollections.findOne(filter);

export const getSession = (filter) => SessionCollections.findOne(filter);
