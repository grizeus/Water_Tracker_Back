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
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateString = `${year}-${month}-${day}`;

  const waterEntries = await WaterCollection.find({
    userId: userId,
    time: { $regex: `^${dateString}` },
  }).sort({ time: 1 });

  const totalConsumed = waterEntries.reduce(
    (sum, entry) => sum + entry.amount,
    0,
  );

  const user = await UserCollections.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const progress = ((totalConsumed / user.dailyGoal) * 100).toFixed(0);

  return {
    dailyGoal: user.dailyGoal,
    progress: Math.min(progress, 100).toString() + '%',
    entries: waterEntries.map((entry) => ({
      _id: entry._id,
      time: entry.time,
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
  const startOfMonth = new Date(`${month}-01T00:00:00.000Z`);
  const endOfMonth = new Date(startOfMonth);
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);

  const waterEntries = await WaterCollection.find({
    userId: userId,
    time: { $regex: `^${month}` },
  }).lean();

  if (!userId) {
    throw new Error('User not found.');
  }

  const dailyData = waterEntries.reduce((acc, entry) => {
    const date = entry.time.split('T')[0];

    if (!acc[date]) {
      acc[date] = {
        date: date,
        totalAmount: 0,
        entriesCount: 0,
        dailyGoal: entry.dailyGoal || 2000,
      };
    }

    acc[date].totalAmount += entry.amount;
    acc[date].entriesCount += 1;
    acc[date].dailyGoal = entry.dailyGoal;

    return acc;
  }, {});

  return Object.values(dailyData).map((day) => {
    let percentage = (day.totalAmount / day.dailyGoal) * 100;
    if (percentage > 100) {
      percentage = 100;
    }

    const dateObj = new Date(day.date);
    const dayNum = dateObj.getUTCDate();
    const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(dateObj);

    return {
      date: `${dayNum},${monthName}`,
      dailyGoal: (day.dailyGoal / 1000).toFixed(1) + ' L',
      percentage: percentage.toFixed(0) + '%',
      entriesCount: day.entriesCount,
    };
  });
};
