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

// export const getMonthlyWaterData = async (userId, month) => {
//   // Нормалізація місяця (формат YYYY-MM)
//   const normalizedMonth = month.slice(0, 7);
  
//   // Створюємо дату початку місяця
//   const startOfMonth = new Date(`${normalizedMonth}-01T00:00:00.000Z`);
  
//   // Створюємо дату кінця місяця
//   const endOfMonth = new Date(startOfMonth);
//   endOfMonth.setMonth(endOfMonth.getMonth() + 1); // Додаємо 1 місяць до стартової дати

//   // Отримуємо всі записи води для користувача за вказаний місяць
//   const waterEntries = await WaterCollection.find({
//     userId: userId,
//     createdAt: { $gte: startOfMonth, $lt: endOfMonth },
//   }).lean();

//   // Якщо користувач не знайдений, викидаємо помилку
//   if (!userId) {
//     throw new Error('User not found.');
//   }

//   // Функція для форматування дати в потрібний формат YYYY-MM-DD-HH:MM
//   const formatDate = (date) => {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const day = String(date.getDate()).padStart(2, '0');
//     const hours = String(date.getHours()).padStart(2, '0');
//     const minutes = String(date.getMinutes()).padStart(2, '0');
//     return `${year}-${month}-${day}-${hours}:${minutes}`;
//   };

//   // Обробка даних по днях
//   const dailyData = waterEntries.reduce((acc, entry) => {
//     // Створюємо новий об'єкт дати для кожного запису
//     const dateObj = new Date(entry.createdAt);
//     const formattedDate = formatDate(dateObj); // Форматуємо дату в потрібний формат

//     // Якщо дата ще не додана в accumulator, додаємо її
//     if (!acc[formattedDate]) {
//       acc[formattedDate] = {
//         date: formattedDate,
//         totalAmount: 0,
//         entriesCount: 0,
//         dailyGoal: entry.dailyGoal || 2000, // Використовуємо 2000 мл як стандартну ціль, якщо її немає
//       };
//     }

//     // Додаємо кількість води та збільшуємо лічильник записів для цього дня
//     acc[formattedDate].totalAmount += entry.amount;
//     acc[formattedDate].entriesCount += 1;

//     return acc;
//   }, {});

//   // Перетворюємо об'єкт dailyData у масив і додаємо процент виконання цілі
//   return Object.values(dailyData).map((day) => {
//     let percentage = (day.totalAmount / day.dailyGoal) * 100;
//     if (percentage > 100) {
//       percentage = 100; // Не дозволяємо перевищувати 100%
//     }

//     return {
//       date: day.date, // Форматована дата
//       dailyGoal: (day.dailyGoal / 1000).toFixed(1) + ' L', // Перетворюємо ціль в літри
//       percentage: percentage.toFixed(0) + '%', // Процент виконання цілі
//       entriesCount: day.entriesCount, // Кількість записів на цей день
//     };
//   });
// };

export const getMonthlyWaterData = async (userId, month) => {
  const normalizedMonth = month.slice(0, 7);

  const startOfMonth = new Date(`${normalizedMonth}-01T00:00:00.000Z`);
  
  const endOfMonth = new Date(startOfMonth);
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);

  const waterEntries = await WaterCollection.find({
    userId: userId,
    createdAt: { $gte: startOfMonth, $lt: endOfMonth },
  }).lean();

  if (!userId) {
    throw new Error('User not found.');
  }

  if (waterEntries.length === 0) {
    throw new Error('No water entries found for the selected month.');
  }

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}-${hours}:${minutes}`;
  };

  const dailyData = waterEntries.reduce((acc, entry) => {
    const dateObj = new Date(entry.createdAt);
    const formattedDate = formatDate(dateObj);

    if (!acc[formattedDate]) {
      acc[formattedDate] = {
        date: formattedDate,
        totalAmount: 0,
        entriesCount: 0,
        dailyGoal: entry.dailyGoal || 2000,
      };
    }

    acc[formattedDate].totalAmount += entry.amount;
    acc[formattedDate].entriesCount += 1;

    return acc;
  }, {});

  if (Object.keys(dailyData).length === 0) {
    throw new Error('No water entries found for any day in the selected month.');
  }

  return Object.values(dailyData).map((day) => {
    let percentage = (day.totalAmount / day.dailyGoal) * 100;
    if (percentage > 100) {
      percentage = 100;
    }

    return {
      date: day.date, 
      dailyGoal: (day.dailyGoal / 1000).toFixed(1) + ' L',
      percentage: percentage.toFixed(0) + '%',
      entriesCount: day.entriesCount,
    };
  });
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
