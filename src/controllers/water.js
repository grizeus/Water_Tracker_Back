import {
  addWaterEntry,
  updateWaterEntry,
  deleteWaterEntry,
  getDailyWaterData,
  getMonthlyWaterData,
  updateDailyWater,
} from '../servises/water-servise.js';

// Додавання запису про випиту воду
export const addWaterEntryController = async (req, res) => { };

// Оновлення запису про випиту воду
export const updateWaterEntryController = async (req, res) => {
  const { id: _id } = req.params;
  const { time, amount } = req.body;

  console.log("Received ID:", _id);
  console.log("Received body:", { amount, time });

  const result = await updateWaterEntry(_id, { amount, time });

  console.log("Update result:", result);

  res.status(200).json({
    data: result,
    message: "Water entry updated successfully"
  })
};

// Видалення запису про випиту воду
export const deleteWaterEntryController = async (req, res) => { };

// Отримання денної статистики
export const getDailyWaterDataController = async (req, res) => { };

// Отримання місячної статистики
export const getMonthlyWaterDataController = async (req, res) => { };

// Оновлення денної норми
export const updateDailyWaterController = async (req, res) => { };
