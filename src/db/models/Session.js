import { Schema, model } from 'mongoose';
import { handleSaveError, setUpdateSettings } from './hooks.js';

const sessionShema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    accessTokenValidUntil: {
      type: Date,
      required: true,
    },
    refreshTokenValidUntil: {
      type: Date,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

sessionShema.post('save', handleSaveError);
sessionShema.pre('findOneAndUpdate', setUpdateSettings);
sessionShema.post('findOneAndUpdate', handleSaveError);

const SessionCollections = model('session', sessionShema);
export default SessionCollections;
