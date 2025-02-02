import createHttpError from 'http-errors';
import DayCollections from '../db/models/Day.js';

//  Додавання запису про випиту воду
export const addWaterEntry = async () => {};

// Оновлення запису про випиту воду
export const updateWaterEntry = async (userId, payload) => {
  return DayCollections.findByIdAndUpdate(userId, {
    ...payload,
    new: true,
  });
};

// Видалення запису про випиту воду
export const deleteWaterEntry = async () => {};

// Отримання денної статистики
export const getDailyWaterData = async () => {};

// Отримання місячної статистики
export const getMonthlyWaterData = async (userId, month) => {
  const normalizedMonth = month.slice(0, 7);

  const days = await DayCollections.find({
    userId: userId,
    date: { $regex: `^${normalizedMonth}` },
  });

  if (!days || days.length === 0) {
    return { data: [] };
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
      percentage: ((day.progress / day.dailyGoal) * 100).toFixed(0) + '%',
      entriesCount: day.entries.length,
    };
  });

  return { data: formattedData };
};
// Оновлення денної норми
export const updateDailyWater = async () => {};
