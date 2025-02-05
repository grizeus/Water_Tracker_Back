import WaterCollections from '../db/models/Water.js';
import UserCollections from '../db/models/User.js';

export const addWaterEntry = async (payload) => {
  const newEntry = WaterCollections.create(payload);

  return newEntry;
};

export const updateWaterEntry = async (id, payload, userId) => {
  const result = await WaterCollections.findOneAndUpdate(
    {
      userId,
      _id: id,
    },
    payload,
    { new: true },
  );

  return result;
};

export const deleteWaterEntry = async (id, userId) => {
  const result = await WaterCollections.findOneAndDelete({ userId, _id: id });

  return result;
};

// Отримання денної статистики
export const getDailyWaterData = async (userId) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const data = await WaterCollections.findOne({
    userId: userId,
    date: { $gte: startOfDay, $lte: endOfDay },
  });

  return data ? { process: data.progress, entries: data.entries } : null;
};

// Отримання місячної статистики
export const getMonthlyWaterData = async (userId, month) => {
  const normalizedMonth = month.slice(0, 7);

  const startOfMonth = new Date(`${normalizedMonth}-01`);
  const endOfMonth = new Date(`${normalizedMonth}-01`);
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);

  const days = await WaterCollections.find({
    userId: userId,
    date: { $gte: startOfMonth, $lt: endOfMonth },
  });

  if (!days || days.length === 0) {
    return {
      message: 'Nothing found.',
      data: [],
    };
  }

  const formattedData = days.map((day) => {
    const dateObj = new Date(day.date);
    const formattedDate = `${dateObj.getDate()}, ${dateObj.toLocaleString(
      'en-US',
      { month: 'long' },
    )}`;

    return {
      date: formattedDate,
      dailyGoal: (day.dailyGoal / 1000).toFixed(1) + ' L',
      percentage: day.progress.toFixed(0) + '%',
      entriesCount: day.entries.length,
    };
  });

  return formattedData;
};
// Оновлення денної норми
export const updateDailyWater = async (userId, dailyGoal) => {
  let dailyRecord = await WaterCollections.findOne({
    userId,
  });

  if (!dailyRecord) {
    dailyRecord = await WaterCollections.create({
      userId,
      dailyGoal,
    });
  } else {
    dailyRecord = await WaterCollections.findOneAndUpdate(
      { userId },
      { dailyGoal },
      { new: true },
    );
  }

  const updatedUserDailyGoal = await UserCollections.findOneAndUpdate(
    { _id: userId },
    { dailyGoal: dailyGoal },
    { new: true },
  );

  return { dailyRecord, updatedUserDailyGoal };
};
