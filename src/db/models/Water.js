import { Schema, model } from 'mongoose';

import { handleSaveError, setUpdateSettings } from './hooks.js';

const waterSchema = new Schema(
  {
    time: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      min: 50,
      max: 5000,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
    timestamps: true,
    versionKey: false,
  },
);

waterSchema.post('save', handleSaveError);
waterSchema.pre('findOneAndUpdate', setUpdateSettings);
waterSchema.post('findOneAndUpdate', handleSaveError);

const WaterCollection = model('water', waterSchema);
export default WaterCollection;
