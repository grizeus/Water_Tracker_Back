import UserCollections from '../db/models/User.js';

export const getUserById = async (userId) => UserCollections.findById(userId);

export const updateUserById = async (userId, updatedData) => {
  //TODO: add search by sessionID and userID
  const updatingResult = await UserCollections.findOneAndUpdate(
    { _id: userId },
    updatedData,
    {
      new: true,
    },
  );

  return updatingResult;
};

export const updateAvatarById = async (userId, avatarURL) => {
  const updatingResult = await UserCollections.findOneAndUpdate(
    { _id: userId },
    { avatar: avatarURL }, // Поле `avatar` може змінюватися відповідно до вашої моделі користувача
    { new: true },
  );

  return updatingResult;
};
