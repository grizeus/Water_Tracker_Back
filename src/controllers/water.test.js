import { describe, it, expect, vi, beforeEach } from 'vitest';
import createHttpError from 'http-errors';
import {
  addWaterEntryController,
  updateWaterEntryController,
  deleteWaterEntryController,
  getDailyWaterDataController,
  getMonthlyWaterDataController,
  updateDailyWaterController,
} from './water.js';
import * as waterService from '../services/water.js';

vi.mock('../services/water.js');

describe('Water Controller', () => {
  let req, res, next;

  const mockWaterEntry = {
    _id: '507f1f77bcf86cd799439011',
    time: '2025-05-16T10:30:00.000Z',
    amount: 250,
    userId: '507f1f77bcf86cd799439022',
    dailyGoal: 2000,
  };

  const mockDailyData = {
    dailyGoal: 2000,
    progress: '50%',
    entries: [
      {
        _id: '507f1f77bcf86cd799439011',
        time: '2025-05-16T10:30:00.000Z',
        amount: 250,
      },
      {
        _id: '507f1f77bcf86cd799439012',
        time: '2025-05-16T14:45:00.000Z',
        amount: 300,
      },
    ],
  };

  const mockMonthlyData = [
    {
      date: '16,May',
      dailyGoal: '2.0 L',
      percentage: '50%',
      entriesCount: 2,
    },
    {
      date: '15,May',
      dailyGoal: '2.0 L',
      percentage: '75%',
      entriesCount: 3,
    },
  ];

  beforeEach(() => {
    req = {
      user: { _id: '507f1f77bcf86cd799439022' },
      body: {},
      params: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      send: vi.fn(),
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe('addWaterEntryController', () => {
    it('should add water entry and return 201 status with entry data', async () => {
      const waterPayload = {
        time: '2025-05-16T10:30:00.000Z',
        amount: 250,
      };
      
      waterService.addWaterEntry.mockResolvedValue(mockWaterEntry);
      req.body = waterPayload;

      await addWaterEntryController(req, res);

      expect(waterService.addWaterEntry).toHaveBeenCalledWith({
        userId: req.user._id,
        ...waterPayload,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        data: {
          _id: mockWaterEntry._id,
          time: mockWaterEntry.time,
          amount: mockWaterEntry.amount,
        },
        message: 'Water entry added successfully',
      });
    });

    it('should handle error when adding water entry fails', async () => {
      const error = new Error('Failed to add water entry');
      waterService.addWaterEntry.mockRejectedValue(error);
      req.body = { time: '2025-05-16T10:30:00.000Z', amount: 250 };

      await expect(addWaterEntryController(req, res)).rejects.toThrow(error);
    });
  });

  describe('updateWaterEntryController', () => {
    it('should update water entry and return 200 status with updated data', async () => {
      const entryId = '507f1f77bcf86cd799439011';
      const updatePayload = {
        time: '2025-05-16T11:30:00.000Z',
        amount: 300,
      };
      const updatedEntry = {
        ...mockWaterEntry,
        ...updatePayload,
      };
      
      waterService.updateWaterEntry.mockResolvedValue(updatedEntry);
      req.params = { id: entryId };
      req.body = updatePayload;

      await updateWaterEntryController(req, res);

      expect(waterService.updateWaterEntry).toHaveBeenCalledWith(
        entryId,
        updatePayload,
        req.user._id
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: {
          _id: updatedEntry._id,
          time: updatedEntry.time,
          amount: updatedEntry.amount,
        },
        message: 'Water entry updated successfully',
      });
    });

    it('should return 400 when update fails', async () => {
      waterService.updateWaterEntry.mockResolvedValue(null);
      req.params = { id: '507f1f77bcf86cd799439011' };
      req.body = { time: '2025-05-16T11:30:00.000Z', amount: 300 };

      await expect(updateWaterEntryController(req, res)).rejects.toThrow(
        createHttpError(400, 'The request cannot be processed.')
      );
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should handle error when updating water entry fails', async () => {
      const error = new Error('Failed to update water entry');
      waterService.updateWaterEntry.mockRejectedValue(error);
      req.params = { id: '507f1f77bcf86cd799439011' };
      req.body = { time: '2025-05-16T11:30:00.000Z', amount: 300 };

      await expect(updateWaterEntryController(req, res)).rejects.toThrow(error);
    });
  });

  describe('deleteWaterEntryController', () => {
    it('should delete water entry and return 204 status', async () => {
      const entryId = '507f1f77bcf86cd799439011';
      
      waterService.deleteWaterEntry.mockResolvedValue(mockWaterEntry);
      req.params = { id: entryId };

      await deleteWaterEntryController(req, res);

      expect(waterService.deleteWaterEntry).toHaveBeenCalledWith(
        entryId,
        req.user._id
      );
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should return 400 when delete fails', async () => {
      waterService.deleteWaterEntry.mockResolvedValue(null);
      req.params = { id: '507f1f77bcf86cd799439011' };

      await expect(deleteWaterEntryController(req, res)).rejects.toThrow(
        createHttpError(400, 'The request cannot be processed.')
      );
      expect(res.status).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();
    });

    it('should handle error when deleting water entry fails', async () => {
      const error = new Error('Failed to delete water entry');
      waterService.deleteWaterEntry.mockRejectedValue(error);
      req.params = { id: '507f1f77bcf86cd799439011' };

      await expect(deleteWaterEntryController(req, res)).rejects.toThrow(error);
    });
  });

  describe('getDailyWaterDataController', () => {
    it('should return daily water data with 200 status', async () => {
      waterService.getDailyWaterData.mockResolvedValue(mockDailyData);

      await getDailyWaterDataController(req, res);

      expect(waterService.getDailyWaterData).toHaveBeenCalledWith(req.user._id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 200,
        data: mockDailyData,
        message: 'Today data successfully found!',
      });
    });

    it('should return 404 when daily data is not found', async () => {
      waterService.getDailyWaterData.mockResolvedValue(null);

      await expect(getDailyWaterDataController(req, res)).rejects.toThrow(
        createHttpError(404, 'The request cannot be processed.')
      );
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should handle error when getting daily water data fails', async () => {
      const error = new Error('Failed to get daily water data');
      waterService.getDailyWaterData.mockRejectedValue(error);

      await expect(getDailyWaterDataController(req, res, next)).rejects.toThrow(error);
    });
  });

  describe('getMonthlyWaterDataController', () => {
    it('should return monthly water data with 200 status', async () => {
      const month = '2025-05';
      
      waterService.getMonthlyWaterData.mockResolvedValue(mockMonthlyData);
      req.params = { month };

      await getMonthlyWaterDataController(req, res);

      expect(waterService.getMonthlyWaterData).toHaveBeenCalledWith(req.user._id, month);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 200,
        data: mockMonthlyData,
        message: 'Monthly water data has been successfully received',
      });
    });

    it('should return 404 when monthly data is not found', async () => {
      waterService.getMonthlyWaterData.mockResolvedValue(null);
      req.params = { month: '2025-05' };

      await expect(getMonthlyWaterDataController(req, res)).rejects.toThrow(
        createHttpError(404, 'The request cannot be processed.')
      );
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should handle error when getting monthly water data fails', async () => {
      const error = new Error('Failed to get monthly water data');
      waterService.getMonthlyWaterData.mockRejectedValue(error);
      req.params = { month: '2025-05' };

      await expect(getMonthlyWaterDataController(req, res)).rejects.toThrow(error);
    });
  });

  describe('updateDailyWaterController', () => {
    it('should update daily water goal and return 200 status', async () => {
      const newDailyGoal = 2500;
      const updatedData = { dailyGoal: newDailyGoal };
      
      waterService.updateDailyGoal.mockResolvedValue(updatedData);
      req.body = { dailyGoal: newDailyGoal };

      await updateDailyWaterController(req, res);

      expect(waterService.updateDailyGoal).toHaveBeenCalledWith(req.user._id, newDailyGoal);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 200,
        message: 'Daily water goal updated successfully.',
        data: newDailyGoal,
      });
    });

    it('should return 400 when dailyGoal is not provided', async () => {
      req.body = {};

      await expect(updateDailyWaterController(req, res)).rejects.toThrow(
        createHttpError(400, 'The request cannot be processed.')
      );
      expect(waterService.updateDailyGoal).not.toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should handle error when updating daily goal fails', async () => {
      const error = new Error('Failed to update daily goal');
      waterService.updateDailyGoal.mockRejectedValue(error);
      req.body = { dailyGoal: 2500 };

      await expect(updateDailyWaterController(req, res)).rejects.toThrow(error);
    });
  });
});
