import mongoose from 'mongoose';
import { handleSaveError, setUpdateSettings } from '../helpers';
import { genderList } from '../../constants/user';

const { Schema, model } = mongoose;

const authSchema = new Schema(
  {
    email: {
      type: String,
      // match: змінна,
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
        return this.email; // Використовуємо email як значення за замовчуванням
      },
    },
    // URL аватара користувача, за замовчуванням Cloudinary посилання
    avatarURL: {
      type: String,
      default: 'https://res.cloudinary.com/',
    },
    token: {
      type: String,
      default: null,
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
