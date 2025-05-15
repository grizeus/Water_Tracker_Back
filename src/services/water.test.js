import { expect, it, vi, beforeEach, describe } from 'vitest';
import mongoose from 'mongoose';
import {
  addWaterEntry,
  updateWaterEntry,
  deleteWaterEntry,
  getDailyWaterData,
  updateDailyGoal,
  getMonthlyWaterData,
} from './water.js';
import WaterCollection from '../db/models/Water.js';
import UserCollections from '../db/models/User.js';

// Mock the collections
// vi.mock('../db/models/Water.js', () => {
//   const mock = {
//     map: vi.fn().mockReturnThis(),
//     create: vi.fn().mockReturnThis(),
//     findOneAndUpdate: vi.fn().mockReturnThis(),
//     findOneAndDelete: vi.fn().mockReturnThis(),
//     find: vi.fn().mockReturnThis(),
//     updateMany: vi.fn().mockReturnThis(),
//     sort: vi.fn().mockReturnThis(),
//     lean: vi.fn().mockReturnThis(),
//     reduce: vi.fn().mockReturnThis(),
//     exec: vi.fn().mockResolvedValue([]),
//   };

//   mock.find.mockImplementation(() => mock);
//   mock.sort.mockImplementation(() => mock);
//   mock.lean.mockImplementation(() => mock);

//   return {
//     default: mock,
//   };
// });
vi.mock('../db/models/Water.js');
vi.mock('../db/models/User.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('addWaterEntry', () => {
  it("should create a water entry with user's daily goal", async () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockUser = {
      _id: mockUserId,
      dailyGoal: 2000,
    };
    const payload = {
      userId: mockUserId,
      amount: 500,
      time: new Date().toISOString(),
    };

    UserCollections.findById.mockResolvedValue(mockUser);
    WaterCollection.create.mockResolvedValue({ ...payload, dailyGoal: 2000 });

    const result = await addWaterEntry(payload);

    expect(UserCollections.findById).toHaveBeenCalledWith(mockUserId);
    expect(WaterCollection.create).toHaveBeenCalledWith({
      dailyGoal: 2000,
      ...payload,
    });
    expect(result).toEqual(expect.objectContaining(payload));
  });
});

describe('updateWaterEntry', () => {
  it('should update a water entry for a specific user', async () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockEntryId = new mongoose.Types.ObjectId();
    const payload = { amount: 750 };
    const updatedEntry = {
      _id: mockEntryId,
      userId: mockUserId,
      amount: 750,
    };

    WaterCollection.findOneAndUpdate.mockResolvedValue(updatedEntry);

    const result = await updateWaterEntry(mockEntryId, payload, mockUserId);

    expect(WaterCollection.findOneAndUpdate).toHaveBeenCalledWith(
      { userId: mockUserId, _id: mockEntryId },
      payload,
      { new: true },
    );
    expect(result).toEqual(updatedEntry);
  });
});

describe('deleteWaterEntry', () => {
  it('should delete a water entry for a specific user', async () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockEntryId = new mongoose.Types.ObjectId();
    const deletedEntry = {
      _id: mockEntryId,
      userId: mockUserId,
      amount: 500,
    };

    WaterCollection.findOneAndDelete.mockResolvedValue(deletedEntry);

    const result = await deleteWaterEntry(mockEntryId, mockUserId);

    expect(WaterCollection.findOneAndDelete).toHaveBeenCalledWith({
      userId: mockUserId,
      _id: mockEntryId,
    });
    expect(result).toEqual(deletedEntry);
  });
});

describe('getDailyWaterData', () => {
  it('should return daily water data for a user', async () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];

    const mockUser = {
      _id: mockUserId,
      dailyGoal: 2000,
    };

    const mockWaterEntries = [
      {
        _id: new mongoose.Types.ObjectId(),
        amount: 500,
        time: `${dateString}T10:00:00Z`,
      },
      {
        _id: new mongoose.Types.ObjectId(),
        amount: 300,
        time: `${dateString}T14:00:00Z`,
      },
    ];


    WaterCollection.find.mockReturnValueOnce(WaterCollection);
    WaterCollection.sort.mockReturnValueOnce(WaterCollection);
    WaterCollection.exec.mockResolvedValueOnce(mockWaterEntries);

    UserCollections.findById.mockResolvedValue(mockUser);

    const result = await getDailyWaterData(mockUserId);

    expect(result).toEqual({
      dailyGoal: 2000,
      progress: '40%',
      entries: mockWaterEntries.map((entry) => ({
        _id: entry._id,
        time: entry.time,
        amount: entry.amount,
      })),
    });
  });

  it('should throw error when user is not found', async () => {
    const mockUserId = new mongoose.Types.ObjectId();

    UserCollections.findById.mockResolvedValue(null);

    await expect(getDailyWaterData(mockUserId)).rejects.toThrow(
      'User not found',
    );
  });
});

describe('updateDailyGoal', () => {
  it('should update daily goal for a user', async () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const newDailyGoal = 3000;
    const mockUser = {
      _id: mockUserId,
      dailyGoal: newDailyGoal,
    };

    UserCollections.findByIdAndUpdate.mockResolvedValue(mockUser);
    WaterCollection.find.mockResolvedValue([{ userId: mockUserId }]);
    WaterCollection.updateMany.mockResolvedValue({
      matchedCount: 1,
      modifiedCount: 1,
    });

    const result = await updateDailyGoal(mockUserId, newDailyGoal);

    expect(result).toEqual({ dailyGoal: newDailyGoal });
  });

  it('should throw error when daily goal exceeds 15000 ml', async () => {
    const mockUserId = new mongoose.Types.ObjectId();

    await expect(updateDailyGoal(mockUserId, 16000)).rejects.toThrow(
      'Daily water goal cannot exceed 15000 ml.',
    );
  });

  it('should throw error when user is not found', async () => {
    const mockUserId = new mongoose.Types.ObjectId();

    UserCollections.findByIdAndUpdate.mockResolvedValue(null);

    await expect(updateDailyGoal(mockUserId, 3000)).rejects.toThrow(
      'User not found.',
    );
  });
});

describe('getMonthlyWaterData', () => {
  it('should return monthly water data for a user', async () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const month = '2023-05';

    const mockWaterEntries = [
      {
        _id: new mongoose.Types.ObjectId(),
        amount: 500,
        time: '2023-05-01T10:00:00Z',
        dailyGoal: 2000,
      },
      {
        _id: new mongoose.Types.ObjectId(),
        amount: 300,
        time: '2023-05-01T14:00:00Z',
        dailyGoal: 2000,
      },
    ];

    WaterCollection.find.mockResolvedValue(mockWaterEntries);

    const result = await getMonthlyWaterData(mockUserId, month);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          date: expect.any(String),
          dailyGoal: expect.any(String),
          percentage: expect.any(String),
          entriesCount: expect.any(Number),
        }),
      ]),
    );
  });

  it('should throw error when userId is not provided', async () => {
    const month = '2023-05';

    await expect(getMonthlyWaterData(null, month)).rejects.toThrow(
      'User not found.',
    );
  });
});
