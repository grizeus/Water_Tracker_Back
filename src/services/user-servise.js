import UserCollections from '../db/models/User.js';

export const getUserById = async (userId) => UserCollections.findById(userId);

export const updateUser = async (userId, updatedData) => {
  const updatingResult = await UserCollections.findOneAndUpdate(
    { _id: userId },
    { $set: updatedData },
    {
      new: true,
    },
  );

  return updatingResult;
};

export const updateAvatar = async (userId, avatarURL) => {
  const updatingResult = await UserCollections.findOneAndUpdate(
    { _id: userId },
    { $set: { avatarURL: avatarURL } },
    { new: true },
  );
  return updatingResult;
};
