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

// Mock the collections with proper chaining methods
vi.mock('../db/models/Water.js', () => {
  return {
    default: {
      create: vi.fn(),
      findOneAndUpdate: vi.fn(),
      findOneAndDelete: vi.fn(),
      find: vi.fn(),
      updateMany: vi.fn(),
    }
  };
});
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

    // Mock the sort method to return the entries
    const mockSort = { sort: vi.fn().mockReturnValue(mockWaterEntries) };
    WaterCollection.find.mockReturnValue(mockSort);
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

    // Mock the sort method to return the entries
    const mockSort = { sort: vi.fn().mockReturnValue([]) };
    WaterCollection.find.mockReturnValue(mockSort);
    UserCollections.findById.mockResolvedValue(null);

    await expect(getDailyWaterData(mockUserId)).rejects.toThrow(
      'User not found'
    );
  });
});

describe('updateDailyGoal', () => {
  const mockUserId = new mongoose.Types.ObjectId();
  const newDailyGoal = 3000;
  const mockUser = {
    _id: mockUserId,
    dailyGoal: newDailyGoal,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update daily goal for a user', async () => {
    UserCollections.findByIdAndUpdate.mockResolvedValue(mockUser);
    WaterCollection.find.mockResolvedValue([{ userId: mockUserId }]);
    WaterCollection.updateMany.mockResolvedValue({
      matchedCount: 1,
      modifiedCount: 1,
    });

    const result = await updateDailyGoal(mockUserId, newDailyGoal);

    expect(UserCollections.findByIdAndUpdate).toHaveBeenCalledWith(
      mockUserId,
      { dailyGoal: newDailyGoal },
      { new: true }
    );
    expect(WaterCollection.find).toHaveBeenCalledWith({
      userId: mockUserId,
      time: expect.any(Object)
    });
    expect(WaterCollection.updateMany).toHaveBeenCalled();
    expect(result).toEqual({ dailyGoal: newDailyGoal });
  });

  it('should handle case with no entries for current day', async () => {
    UserCollections.findByIdAndUpdate.mockResolvedValue(mockUser);
    WaterCollection.find.mockResolvedValue([]);

    const result = await updateDailyGoal(mockUserId, newDailyGoal);

    expect(WaterCollection.updateMany).not.toHaveBeenCalled();
    expect(result).toEqual({ dailyGoal: newDailyGoal });
  });

  it('should throw error when update fails for some entries', async () => {
    UserCollections.findByIdAndUpdate.mockResolvedValue(mockUser);
    WaterCollection.find.mockResolvedValue([{ userId: mockUserId }]);
    WaterCollection.updateMany.mockResolvedValue({
      matchedCount: 2,
      modifiedCount: 1,
    });

    await expect(updateDailyGoal(mockUserId, newDailyGoal)).rejects.toThrow(
      'Not every entry was updated'
    );
  });

  it('should throw error when daily goal exceeds 15000 ml', async () => {
    await expect(updateDailyGoal(mockUserId, 16000)).rejects.toThrow(
      'Daily water goal cannot exceed 15000 ml.'
    );
  });

  it('should throw error when user is not found', async () => {
    UserCollections.findByIdAndUpdate.mockResolvedValue(null);

    await expect(updateDailyGoal(mockUserId, 3000)).rejects.toThrow(
      'User not found.'
    );
  });

  it('should handle zero as daily goal', async () => {
    UserCollections.findByIdAndUpdate.mockResolvedValue({
      ...mockUser,
      dailyGoal: 0
    });
    WaterCollection.find.mockResolvedValue([]);

    const result = await updateDailyGoal(mockUserId, 0);

    expect(result).toEqual({ dailyGoal: 0 });
  });
});

describe('getMonthlyWaterData', () => {
  const mockUserId = new mongoose.Types.ObjectId();
  const month = '2023-05';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockLean = (entries) => ({
    lean: vi.fn().mockReturnValue(entries)
  });

  it('should return monthly water data for a user', async () => {
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

    WaterCollection.find.mockReturnValue(createMockLean(mockWaterEntries));

    const result = await getMonthlyWaterData(mockUserId, month);

    expect(WaterCollection.find).toHaveBeenCalledWith({
      userId: mockUserId,
      time: { $regex: `^${month}` }
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      date: '1,May',
      dailyGoal: '2.0 L',
      percentage: '40%',
      entriesCount: 2
    });
  });

  it('should handle empty month data', async () => {
    WaterCollection.find.mockReturnValue(createMockLean([]));

    const result = await getMonthlyWaterData(mockUserId, '2023-02');

    expect(result).toEqual([]);
  });

  it('should handle entries with different daily goals on same day', async () => {
    const mockWaterEntries = [
      { amount: 500, time: '2023-05-01T10:00:00Z', dailyGoal: 2000 },
      { amount: 300, time: '2023-05-01T14:00:00Z', dailyGoal: 1500 },
    ];

    WaterCollection.find.mockReturnValue(createMockLean(mockWaterEntries));

    const result = await getMonthlyWaterData(mockUserId, month);

    expect(result[0].percentage).toBe('53%'); // (800/1500)*100 = 53.33% rounded
  });

  it('should cap percentage at 100%', async () => {
    const mockWaterEntries = [
      { amount: 2000, time: '2023-05-01T10:00:00Z', dailyGoal: 1000 },
    ];

    WaterCollection.find.mockReturnValue(createMockLean(mockWaterEntries));

    const result = await getMonthlyWaterData(mockUserId, month);

    expect(result[0].percentage).toBe('100%');
  });

  it('should handle leap year February', async () => {
    const mockWaterEntries = [
      { amount: 500, time: '2024-02-29T10:00:00Z', dailyGoal: 2000 },
    ];

    WaterCollection.find.mockReturnValue(createMockLean(mockWaterEntries));

    const result = await getMonthlyWaterData(mockUserId, '2024-02');

    expect(result[0].date).toBe('29,February');
  });

  it('should handle multiple days in month', async () => {
    const mockWaterEntries = [
      { amount: 500, time: '2023-05-01T10:00:00Z', dailyGoal: 2000 },
      { amount: 300, time: '2023-05-15T14:00:00Z', dailyGoal: 2000 },
    ];

    WaterCollection.find.mockReturnValue(createMockLean(mockWaterEntries));

    const result = await getMonthlyWaterData(mockUserId, month);

    expect(result).toHaveLength(2);
    expect(result[0].date).toBe('1,May');
    expect(result[1].date).toBe('15,May');
  });

  it('should handle invalid month format', async () => {
    await expect(
      getMonthlyWaterData(mockUserId, 'invalid-date'),
    ).rejects.toThrow('Invalid month format. Expected format: YYYY-MM');
  });

  it('should throw error when userId is not provided', async () => {
    await expect(getMonthlyWaterData(null, month)).rejects.toThrow('User not found.');
  });

  it('should handle zero daily goal', async () => {
    const mockWaterEntries = [
      { amount: 500, time: '2023-05-01T10:00:00Z', dailyGoal: 0 },
    ];

    WaterCollection.find.mockReturnValue(createMockLean(mockWaterEntries));

    const result = await getMonthlyWaterData(mockUserId, month);

    // Should handle division by zero and return 0% or handle it appropriately
    expect(result[0].percentage).toBe('0%');
  });
});
