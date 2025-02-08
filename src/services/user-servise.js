import bcrypt from 'bcrypt';

import UserCollections from '../db/models/User.js';

export const getUserById = async (userId) => UserCollections.findById(userId);

export const updateUser = async (userId, updatedData) => {
  const user = await UserCollections.findOne({ _id: userId }); 
  if (!user) {
    throw new Error('User not found');
  }

  if (updatedData.oldPassword && updatedData.newPassword) {
    const isMatch = await bcrypt.compare(updatedData.oldPassword, user.password);
    if (!isMatch) {
      throw new Error('Old password is incorrect');
    }

    const salt = await bcrypt.genSalt(10);
    updatedData.password = await bcrypt.hash(updatedData.newPassword, salt);

    delete updatedData.oldPassword;
    delete updatedData.newPassword;
  }

  const updatingResult = await UserCollections.findOneAndUpdate(
    { _id: userId },
    { $set: updatedData },
    { new: true }
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
