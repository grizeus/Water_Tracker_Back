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
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Хук для обробки помилок
waterSchema.post('save', handleSaveError);
waterSchema.pre('findOneAndUpdate', setUpdateSettings);
waterSchema.post('findOneAndUpdate', handleSaveError);

const WaterCollections = model('water', waterSchema);
export default WaterCollections;
