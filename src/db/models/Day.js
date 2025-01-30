import { Schema, model } from 'mongoose';
import { handleSaveError, setUpdateSettings } from './hooks.js';

const waterEntrySchema = new Schema({
  time: {
    type: String,
    required: false,
  },
  amount: {
    type: Number,
    required: false,
    min: 50,
    max: 5000,
  },
});

const waterTrackingSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  dailyGoal: {
    type: Number,
    required: true,
    min: 50,
    max: 15000,
    default: 2000,
  },
  entries: {
    type: [waterEntrySchema],
    default: [],
  },
  progress: {
    type: Number,
    default: 0,
  },
});

// Оновлення progress перед збереженням коли додаємо нове значення
waterTrackingSchema.pre('save', function (next) {
  const totalConsumed = this.entries.reduce(
    (sum, entry) => sum + entry.amount,
    0,
  );
  this.progress =
    this.dailyGoal > 0
      ? Math.min((totalConsumed / this.dailyGoal) * 100, 100)
      : 0;
  next();
});

// Оновлення progress перед оновленням через findOneAndUpdate коли хочемо змінити вже існуючий запис
waterTrackingSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();

  if (update.entries) {
    const totalConsumed = update.entries.reduce(
      (sum, entry) => sum + entry.amount,
      0,
    );

    update.progress =
      update.dailyGoal > 0
        ? Math.min((totalConsumed / update.dailyGoal) * 100, 100)
        : 0;
  }

  next();
});

waterTrackingSchema.post('save', handleSaveError);
waterTrackingSchema.pre('findOneAndUpdate', setUpdateSettings);
waterTrackingSchema.post('findOneAndUpdate', handleSaveError);

const DayCollections = model('day', waterTrackingSchema);
export default DayCollections;
