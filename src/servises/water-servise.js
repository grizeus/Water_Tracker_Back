import DayCollections from '../db/models/Day.js';

//  Додавання запису про випиту воду
export const addWaterEntry = async () => {};

// Оновлення запису про випиту воду
export const updateWaterEntry = async () => {};

// Видалення запису про випиту воду
export const removeWaterEntry = async (entryId) => {};

// Отримання денної статистики
export const getDailyWaterData = async (userId) => {};

// Отримання місячної статистики
export const getMonthlyWaterDataController = async (userId, month) => {};

// Оновлення денної норми
export const updateDailyWaterController = async (userId, dailyGoal) => {};
