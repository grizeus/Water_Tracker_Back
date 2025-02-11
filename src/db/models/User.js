import mongoose from 'mongoose';

import { handleSaveError, setUpdateSettings } from './hooks.js';

import { genderList } from '../../constants/user.js';
import { regularExpressionEmail } from '../../constants/auth.js';

const { Schema, model } = mongoose;

const authSchema = new Schema(
  {
    email: {
      type: String,
      match: regularExpressionEmail,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      minLength: 8,
      maxLength: 64,
      required: true,
    },
    gender: {
      type: String,
      enum: genderList,
      default: 'woman',
    },
    name: {
      type: String,
      minLength: 3,
      maxLength: 24,
      default: function () {
        return this.email;
      },
    },
    avatarURL: {
      type: String,
      // default:
      // 'https://asset.cloudinary.com/dtyqyfest/f14d60e17eae987dfc70575c82cfe529',
    },
    dailyGoal: {
      type: Number,
      required: true,
      min: 50,
      max: 15000,
      default: 2000,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

authSchema.post('save', handleSaveError);
authSchema.pre('findOneAndUpdate', setUpdateSettings);
authSchema.post('findOneAndUpdate', handleSaveError);

const UserCollections = model('user', authSchema);
export default UserCollections;
