import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import UserCollections from '../db/models/User.js';
import SessionCollections from '../db/models/User.js';

import { getEnvVar } from '../utils/getEnvVar.js';

export const registerUser = async () => {};

export const loginUser = async () => {};

export const refresh = async () => {};

export const logout = async () => {};

export const getUser = (filter) => UserCollections.findOne(filter);

export const getSession = (filter) => SessionCollections.findOne(filter);
