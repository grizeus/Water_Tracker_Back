import createHttpError from 'http-errors';

import {
  addWaterEntry,
  updateWaterEntry,
  deleteWaterEntry,
  getDailyWaterData,
  getMonthlyWaterData,
  updateDailyWater,
} from '../services/water-servise.js';

export const addWaterEntryController = async (req, res) => {
  const userId = req.user._id;
  const result = await addWaterEntry({ userId, ...req.body });

  res.status(201).json({
    data: {
      time: result.time,
      amount: result.amount,
      _id: result._id,
    },
    message: 'Water entry added successfully',
  });
};

export const updateWaterEntryController = async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const { time, amount } = req.body;

  const result = await updateWaterEntry(id, { amount, time }, userId);

  if (!result) {
    throw createHttpError(404, 'Water entry not found');
  }

  res.status(200).json({
    data: {
      time: result.time,
      amount: result.amount,
      _id: result._id,
    },
    message: 'Water entry updated successfully',
  });
};

export const deleteWaterEntryController = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const result = await deleteWaterEntry(id, userId);

  if (!result) {
    throw createHttpError(404, 'Water entry not found');
  }

  res.status(204).send();
};

export const getMonthlyWaterDataController = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { date } = req.params;

    const result = await getMonthlyWaterData(userId, date);

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
      data: result.dailyGoal,
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
};
