import createHttpError from 'http-errors';
// import mongoose from 'mongoose';

import {
  addWaterEntry,
  updateWaterEntry,
  deleteWaterEntry,
  getDailyWaterData,
  getMonthlyWaterData,
  updateDailyWater,
} from '../servises/water-servise.js';

// Додавання запису про випиту воду
export const addWaterEntryController = async (req, res) => {
  console.log('Request body:', req.body);
  const { userId, amount, time } = req.body;

  const result = await addWaterEntry(userId, amount, time);

  if (!result) {
    throw createHttpError(404, 'Water entry not found');
  }
  res.status(201).json({
    data: result,
    message: 'Water entry added successfully',
  });
};

// Оновлення запису про випиту воду
export const updateWaterEntryController = async (req, res) => {
  const userId = req.user._id;

  const { id: id } = req.params;

  const { time, amount } = req.body;

  const result = await updateWaterEntry(id, { amount, time }, userId);

  if (!result) {
    throw createHttpError(404, 'Water entry not found');
  }

  res.status(200).json({
    data: result,
    message: 'Water entry updated successfully',
  });
};

// Видалення запису про випиту воду
export const deleteWaterEntryController = async (req, res) => {
  const { id: _id } = req.params;
  const userId = req.user._id;

  try {
    await deleteWaterEntry(_id, userId);
  } catch (e) {
    if (e instanceof Error) {
      throw createHttpError(404, 'Entry not found');
    }
  }

  res.status(204).send();
};

// Отримання місячної статистики
export const getMonthlyWaterDataController = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { month } = req.params;

    const result = await getMonthlyWaterData(userId, month);

    if (result.length === 0) {
      return res.status(404).json({
        status: 404,
        message: 'No water consumption data found for this month',
        data: [],
      });
    }

    res.status(200).json({
      status: 200,
      data: result,
      message: 'Monthly water data retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
};

// отримання денної норми
export const getDailyWaterDataController = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const result = await getDailyWaterData(userId);

    if (!result) {
      return res.status(404).json({
        status: 404,
        message: 'No entries found for today',
        data: null,
      });
    }

    res.status(200).json({
      status: 200,
      data: result,
      message: 'Daily water goal retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Оновлюємо або створюємо запис у WaterCollections
export const updateDailyWaterController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { dailyGoal } = req.body;

    if (!dailyGoal) {
      return res.status(400).json({
        status: 400,
        message: 'Daily goal is required.',
      });
    }

    const result = await updateDailyWater(userId, dailyGoal);

    res.status(200).json({
      status: 200,
      message: 'Daily water goal updated successfully.',
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
};
