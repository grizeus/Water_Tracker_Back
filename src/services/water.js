import WaterCollection from '../db/models/Water.js';
import UserCollections from '../db/models/User.js';

export const addWaterEntry = async (payload) => {
  const { userId } = payload;
  const user = await UserCollections.findById(userId);
  const dailyGoal = user.dailyGoal;

  const newEntry = await WaterCollection.create({ dailyGoal, ...payload });

  return newEntry;
};

export const updateWaterEntry = async (id, payload, userId) => {
  const result = await WaterCollection.findOneAndUpdate(
    {
      userId,
      _id: id,
    },
    payload,
    { new: true },
  );

  return result;
};

export const deleteWaterEntry = async (id, userId) => {
  const result = await WaterCollection.findOneAndDelete({ userId, _id: id });

  return result;
};

export const getDailyWaterData = async (userId) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const waterEntries = await WaterCollection.find({
    userId: userId,
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  }).sort({ createdAt: -1 });

  const totalConsumed = waterEntries.reduce(
    (sum, entry) => sum + entry.amount,
    0,
  );

  const user = await UserCollections.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const dailyGoal = user.dailyGoal;
  const progress = ((totalConsumed / dailyGoal) * 100).toFixed(0);
  const dailyGoalLiters = (dailyGoal / 1000).toFixed(1) + "L";
  
  return {
    dailyGoalLiters: dailyGoalLiters,
    progress: Math.min(progress, 100).toString() + "%",
    entries: waterEntries.map((entry) => ({
      _id: entry._id,
      time: entry.updatedAt.toISOString().slice(0, 16),
      amount: entry.amount,
    })),
  };
};

export const updateDailyGoal = async (userId, dailyGoal) => {
  if (dailyGoal > 15000) {
    throw new Error('Daily water goal cannot exceed 15000 ml.');
  }

  const updatedUser = await UserCollections.findByIdAndUpdate(
    userId,
    { dailyGoal },
    { new: true },
  );

  if (!updatedUser) {
    throw new Error('User not found.');
  }

  const currentDay = new Date(Date.now()).toISOString().split('T')[0];

  const entries = await WaterCollection.find({ userId, time: { $regex: `^${currentDay}` } });
  if (entries.length !== 0) {
    const updatedEntries = await WaterCollection.updateMany(
      { userId, time: { $regex: `^${currentDay}` } },
      { $set: { dailyGoal: dailyGoal } },
    );
 
    if (updatedEntries.matchedCount !== updatedEntries.modifiedCount) {
      throw new Error('Not every entry was updated');
    }
  }

  return { dailyGoal: updatedUser.dailyGoal };
};


export const getMonthlyWaterData = async (userId, month) => {
  if (!userId) {
    throw new Error('User not found.');
  }

  const startOfMonth = new Date(`${month}-01T00:00:00.000Z`);
  const endOfMonth = new Date(startOfMonth);
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);

  const waterEntries = await WaterCollection.find({
    userId: userId,
    createdAt: { $gte: startOfMonth, $lt: endOfMonth },
  }).lean();

  const dailyStats = {};

  waterEntries.forEach((entry) => {
    const dateKey = entry.time.split('T')[0];
    
    if (!dailyStats[dateKey]) {
      dailyStats[dateKey] = {
        date: dateKey,
        totalAmount: 0,
        entriesCount: 0,
        dailyGoal: entry.dailyGoal || 2000,
      };
    }
    
    dailyStats[dateKey].totalAmount += entry.amount;
    dailyStats[dateKey].entriesCount += 1;
  });

  return Object.values(dailyStats).map((day) => {
    let percentage = (day.totalAmount / day.dailyGoal) * 100;
    if (percentage > 100) {
      percentage = 100;
    }

    return {
      date: day.date,
      dailyGoal: (day.dailyGoal / 1000).toFixed(1) + ' L',
      totalAmount: (day.totalAmount / 1000).toFixed(1) + ' L',
      percentage: percentage.toFixed(0) + '%',
      entriesCount: day.entriesCount,
    };
  });
};
