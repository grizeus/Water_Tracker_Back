import DayCollections from '../db/models/Day.js';

//  Додавання запису про випиту воду
export const addWaterEntry = async () => { };

// Оновлення запису про випиту воду
export const updateWaterEntry = async (userId, payload) => {
    return DayCollections.findByIdAndUpdate(userId, {
        ...payload,
        new: true
    })
};

// Видалення запису про випиту воду
export const deleteWaterEntry = async () => { };

// Отримання денної статистики
export const getDailyWaterData = async () => { };

// Отримання місячної статистики
export const getMonthlyWaterData = async () => { };

// Оновлення денної норми
export const updateDailyWater = async () => { };
