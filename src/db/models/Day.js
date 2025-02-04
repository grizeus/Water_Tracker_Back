import { Schema, model } from 'mongoose';
import { handleSaveError, setUpdateSettings } from './hooks.js';

const waterEntrySchema = new Schema({
  _id: { type: Schema.Types.ObjectId, auto: true },
  time: {
    type: String,
    required: true,
    default: function () {
      return new Date().toLocaleTimeString('uk-UA', {
        hour: '2-digit',
        minute: '2-digit',
      });
    },
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
    type: Date, // YYYY-MM-DD
    required: new Date(),
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

// Функція для перерахунку прогресу
const calculateProgress = (entries, dailyGoal) => {
  const totalConsumed = entries.reduce((sum, entry) => sum + entry.amount, 0);
  return dailyGoal > 0 ? Math.min((totalConsumed / dailyGoal) * 100, 100) : 0;
};

// Хук для перерахунку прогресу перед збереженням
waterTrackingSchema.pre('save', function (next) {
  this.progress = calculateProgress(this.entries, this.dailyGoal);
  next();
});

// Хук для перерахунку прогресу при оновленні запису
waterTrackingSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();
  const existingDoc = await this.model.findOne(this.getQuery());

  if (!existingDoc) {
    return next();
  }

  let updatedEntries = [...existingDoc.entries];

  // Додавання нових записів
  if (update.$push && update.$push.entries) {
    updatedEntries.push(...update.$push.entries);
  }

  // Видалення записів
  if (update.$pull && update.$pull.entries) {
    const condition = update.$pull.entries;
    updatedEntries = updatedEntries.filter((entry) => {
      return !Object.keys(condition).every(
        (key) => entry[key] === condition[key],
      );
    });
  }

  // Оновлення конкретного запису
  if (update.$set && update.$set['entries.$']) {
    const updatedEntry = update.$set['entries.$'];
    updatedEntries = updatedEntries.map((entry) =>
      entry._id.equals(updatedEntry._id)
        ? { ...entry, ...updatedEntry }
        : entry,
    );
  }

  // Оновлення прогресу після змін
  update.$set = update.$set || {};

  // Оновлюємо прогрес на основі нових значень
  update.$set.progress = calculateProgress(
    updatedEntries,
    update.$set.dailyGoal || existingDoc.dailyGoal,
  );

  // Якщо змінився dailyGoal, треба пересчитати прогрес
  if (
    update.$set.dailyGoal &&
    update.$set.dailyGoal !== existingDoc.dailyGoal
  ) {
    update.$set.progress = calculateProgress(
      updatedEntries,
      update.$set.dailyGoal,
    );
  }

  next();
});

// Хук для обробки помилок
waterTrackingSchema.post('save', handleSaveError);
waterTrackingSchema.pre('findOneAndUpdate', setUpdateSettings);
waterTrackingSchema.post('findOneAndUpdate', handleSaveError);

const DayCollections = model('day', waterTrackingSchema);
export default DayCollections;
