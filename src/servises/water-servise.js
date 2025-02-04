import DayCollections from '../db/models/Day.js';

//  Додавання запису про випиту воду
export const addWaterEntry = async (userId, amount, time) => {
  try {
    // const newEntry = {
    //   _id: userId,
    //   time,
    //   amount,
    // };

    // Добавляем запись в массив entries
    const result = await DayCollections.updateOne(
      { userId },
      { $push: { entries: { amount: '', time: '' } } },
      { upsert: true }
    );

    return { success: true, message: 'Запись добавлена', data: result.entries };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// async (payload) => await DayCollections.create(payload);

// async () => {
//   const result = await DayCollections.create(
//     { new: true },
//     { $push: { entries: { amount: '', time: '' } } },
//     // { date: new Date().toISOString() },
//   );
//   return result;
// };

// Оновлення запису про випиту воду
export const updateWaterEntry = async (id, payload, userId) => {
  console.log('Searching for:', { userId, entryId: id, payload });

  // Оновлення конкретного запису в масиві entries
  const result = await DayCollections.findOneAndUpdate(
    {
      userId: userId,
      'entries._id': id,
    },
    {
      $set: {
        'entries.$[elem].amount': payload.amount,
        'entries.$[elem].time': payload.time,
      },
    },
    {
      new: true,
      arrayFilters: [{ 'elem._id': id }],
    },
  );
  const updatedEntry = result.entries.find(
    (entry) => entry._id.toString() === id,
  );
  console.log('Update result:', result);
  return updatedEntry;
};

export const deleteWaterEntry = async (_id, userId) => {
  const result = await DayCollections.updateOne(
    { userId, 'entries._id': _id },
    { $pull: { entries: { _id } } },
    { new: true },
  );

  if (result.modifiedCount === 0) {
    throw new Error('Entry not found');
  }
};

// Отримання денної статистики
export const getDailyWaterData = async () => {};

// Отримання місячної статистики
export const getMonthlyWaterData = async (userId, month) => {
  const normalizedMonth = month.slice(0, 7);

  const days = await DayCollections.find({
    userId: userId,
    date: { $regex: `^${normalizedMonth}` },
  });

  if (!days || days.length === 0) {
    return { data: [] };
  }

  const formattedData = days.map((day) => {
    const dateObj = new Date(day.date);
    const formattedDate = `${dateObj.getDate()}, ${dateObj.toLocaleString(
      'en-US',
      { month: 'long' },
    )}`;

    return {
      date: formattedDate,
      dailyGoal: (day.dailyGoal / 1000).toFixed(1) + ' L',
      percentage: ((day.progress / day.dailyGoal) * 100).toFixed(0) + '%',
      entriesCount: day.entries.length,
    };
  });

  return { data: formattedData };
};
// Оновлення денної норми
export const updateDailyWater = async () => {};
