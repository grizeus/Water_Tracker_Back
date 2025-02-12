import createHttpError from 'http-errors';

import {
  addWaterEntry,
  updateWaterEntry,
  deleteWaterEntry,
  getDailyWaterData,
  getMonthlyWaterData,
  updateDailyGoal,
} from '../services/water.js';

export const addWaterEntryController = async (req, res) => {
  const userId = req.user._id;
  const result = await addWaterEntry({ userId, ...req.body });

  res.status(201).json({
    data: {
      _id: result._id,
      time: result.time,
      amount: result.amount,
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
    throw createHttpError(400, 'The request cannot be processed.');
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
    throw createHttpError(400, 'The request cannot be processed.');
  }

  res.status(204).send();
};

export const getMonthlyWaterDataController = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { month } = req.params;

    const result = await getMonthlyWaterData(userId, month);

    if (!result) {
      throw createHttpError(404, 'The request cannot be processed.');
    }

    res.status(200).json({
      status: 200,
      data: result,
      message: 'Monthly water data has been successfully received',
    });
  } catch (error) {
    next(error);
  }
};

export const getDailyWaterDataController = async (req, res, next) => {
  const userId = req.user._id;

  const result = await getDailyWaterData(userId);

  if (!result) {
    throw createHttpError(404, 'The request cannot be processed.');
  }

  res.status(200).json({
    status: 200,
    data: result,
    message: 'Today data successfully found!',
  });
};

export const updateDailyWaterController = async (req, res) => {
  const userId = req.user._id;
  const { dailyGoal } = req.body;

  if (!dailyGoal) {
    throw createHttpError(400, 'The request cannot be processed.');
  }

  const result = await updateDailyGoal(userId, dailyGoal);

  res.status(200).json({
    status: 200,
    message: 'Daily water goal updated successfully.',
    data: result.dailyGoal,
  });
};
