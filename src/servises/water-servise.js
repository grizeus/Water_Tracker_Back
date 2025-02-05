import WaterCollections from '../db/models/Water.js';
import UserCollections from '../db/models/User.js';
import mongoose from 'mongoose';

//  Додавання запису про випиту воду
export const addWaterEntry = async (userId, amount, time) => {
  const newEntry = {
    _id: new mongoose.Types.ObjectId(),
    userId: userId,
    time: time,
    amount: amount,
  };

  // Додавання запису в масив entries
  await WaterCollections.updateOne(
    { userId },
    { $push: { entries: newEntry } },
    { upsert: true },
  );

  return { message: 'Запис успішно додано', data: newEntry };
};

// Оновлення запису про випиту воду
export const updateWaterEntry = async (id, payload, userId) => {
  // Оновлення конкретного запису в масиві entries
  const result = await WaterCollections.findOneAndUpdate(
    {
      userId: userId,
      'entries._id': id,
    },
    {
      $set: {
        'entries.$[elem].amount': payload.amount,
        'entries.$[elem].time': payload.time,
      },
    },
    {
      new: true,
      arrayFilters: [{ 'elem._id': id }],
    },
  );

  if (!result) return null;

  const updatedEntry = result.entries.find(
    (entry) => entry._id.toString() === id,
  );
  return updatedEntry;
};

export const deleteWaterEntry = async (_id, userId) => {
  const result = await WaterCollections.updateOne(
    { userId, 'entries._id': _id },
    { $pull: { entries: { _id } } },
    { new: true },
  );

  if (result.modifiedCount === 0) {
    throw new Error('Entry not found');
  }
};

// Отримання денної статистики
export const getDailyWaterData = async (userId) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  // Отримуємо всі записи води за сьогодні
  const waterEntries = await WaterCollections.find({
    userId: userId,
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  }).sort({ createdAt: -1 });

  // Підраховуємо загальну кількість випитої води
  const totalConsumed = waterEntries.reduce(
    (sum, entry) => sum + entry.amount,
    0,
  );

  // Отримуємо денну норму користувача
  const user = await UserCollections.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const dailyGoal = user.dailyGoal;
  const progress = ((totalConsumed / dailyGoal) * 100).toFixed(2); // Розрахунок у %

  return {
    progress: Math.min(progress, 100), // Не більше 100%
    totalConsumed,
    dailyGoal,
    entries: waterEntries,
  };
};

// Отримання місячної статистики
export const getMonthlyWaterData = async (userId, month) => {
  const normalizedMonth = month.slice(0, 7);
  const startOfMonth = new Date(`${normalizedMonth}-01T00:00:00.000Z`);
  const endOfMonth = new Date(startOfMonth);
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);

  // Отримуємо всі записи води за місяць
  const waterEntries = await WaterCollections.find({
    userId: userId,
    createdAt: { $gte: startOfMonth, $lt: endOfMonth },
  }).lean();

  if (!waterEntries.length) {
    return [];
  }

  // Групуємо дані по днях
  const dailyData = waterEntries.reduce((acc, entry) => {
    const dateObj = new Date(entry.createdAt);
    const formattedDate = `${dateObj.getDate()}, ${dateObj.toLocaleString(
      'en-US',
      { month: 'long' },
    )}`;

    if (!acc[formattedDate]) {
      acc[formattedDate] = {
        date: formattedDate,
        totalAmount: 0,
        entriesCount: 0,
      };
    }

    acc[formattedDate].totalAmount += entry.amount;
    acc[formattedDate].entriesCount += 1;

    return acc;
  }, {});

  // Форматуємо вихідні дані
  return Object.values(dailyData).map((day) => ({
    date: day.date,
    dailyGoal: (day.dailyGoal / 1000).toFixed(1) + ' L',
    percentage: ((day.totalAmount / day.dailyGoal) * 100).toFixed(0) + '%',
    entriesCount: day.entriesCount,
  }));
};

// Оновлення денної норми
export const updateDailyWater = async (userId, dailyGoal) => {
  // Обмеження на максимальне значення
  if (dailyGoal > 15000) {
    throw new Error('Daily water goal cannot exceed 15000 ml.');
  }

  // Оновлюємо денну норму в UserCollections
  const updatedUser = await UserCollections.findByIdAndUpdate(
    userId,
    { dailyGoal },
    { new: true },
  );

  if (!updatedUser) {
    throw new Error('User not found.');
  }

  // Оновлюємо або створюємо запис у WaterCollections
  let dailyRecord = await WaterCollections.findOne({ userId });

  if (!dailyRecord) {
    dailyRecord = await WaterCollections.create({ userId, dailyGoal });
  } else {
    dailyRecord.dailyGoal = dailyGoal;
    await dailyRecord.save();
  }

  return { updatedUser, dailyRecord };
};
