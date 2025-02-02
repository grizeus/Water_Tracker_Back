import createHttpError from 'http-errors';
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
  const { time, amount, userId } = req.body;

  console.log("User ID:", userId);
  console.log("Received ID:", _id);
  console.log("Received body:", { amount, time });

  const result = await updateWaterEntry(_id, { amount, time });

  console.log("Update result:", result);

  if (!result) throw createHttpError(404, "User not found")

  res.status(200).json({
    data: result,
    message: "Water entry updated successfully"
  })
};

export const deleteWaterEntryController = async (req, res) => {

  const {id: _id } = req.params;
  const userId = req.user._id;

  const result = await deleteWaterEntry({_id, userId});

  if (!result) {
    throw createHttpError(404, "Entry not found");
  }

  res.status(204).send();
};

// Отримання денної статистики
export const getDailyWaterDataController = async (req, res) => { };

// Отримання місячної статистики
export const getMonthlyWaterDataController = async (req, res) => { };

// Оновлення денної норми
export const updateDailyWaterController = async (req, res) => { };
