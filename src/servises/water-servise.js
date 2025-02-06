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

// Отримання денної статистики
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

  return {
    dailyGoal: dailyGoal,
    progress: Math.min(progress, 100),
    entries: waterEntries.map((entry) => ({
      _id: entry._id,
      time: entry.createdAt,
      amount: entry.amount,
    })),
  };
};

export const getMonthlyWaterData = async (userId, month) => {
  const normalizedMonth = month.slice(0, 7);
  const startOfMonth = new Date(`${normalizedMonth}-01T00:00:00.000Z`);
  const endOfMonth = new Date(startOfMonth);
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);

  const waterEntries = await WaterCollection.find({
    userId: userId,
    createdAt: { $gte: startOfMonth, $lt: endOfMonth },
  }).lean();

  if (!waterEntries.length) {
    return null;
  }

  const user = await UserCollections.findById(userId);
  const todayGoal = user && user.dailyGoal;

  // Групуємо дані по днях
  const dailyData = waterEntries.reduce((acc, entry) => {
    const dateObj = new Date(entry.createdAt);
    const formattedDate = `${dateObj.getDate()}, ${dateObj.toLocaleString(
      'en-US',
      { month: 'long' },
    )}`;

    if (!acc[formattedDate]) {
      acc[formattedDate] = {
        date: formattedDate,
        totalAmount: 0,
        entriesCount: 0,
      };
    }

    acc[formattedDate].totalAmount += entry.amount;
    acc[formattedDate].entriesCount += 1;

    return acc;
  }, {});

  return Object.values(dailyData).map((day) => {
    let percentage = (day.totalAmount / todayGoal) * 100;

    if (percentage > 100) {
      percentage = 100;
    }

    return {
      date: day.date,
      dailyGoal: (todayGoal / 1000).toFixed(1) + ' L',
      percentage: percentage.toFixed(0) + '%',
      entriesCount: day.entriesCount,
    };
  });
};

export const updateDailyWater = async (userId, dailyGoal) => {
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

  // update of today's records
  const updatedEntries = await WaterCollection.updateMany(
    { userId, time: { $regex: `^${currentDay}` } },
    { $set: dailyGoal },
  );

  if (updatedEntries.matchedCount !== updatedEntries.modifiedCount) {
    throw new Error('Not every entry was updated');
  }

  return { dailyGoal: updatedUser.dailyGoal };
};
