import createHttpError from 'http-errors';
import {
  getUserById,
  updateAvatar,
  updateUser,
} from '../services/user.js';

import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';

export const getUserController = async (req, res, next) => {
  const userId = req.user._id;
  const user = await getUserById(userId);

  if (!user) {
    return createHttpError(404,'The request cannot be processed.');
  }

  res.json({
    status: 200,
    message: 'Successfully found user!',
    data: {
      email: user.email,
      gender: user.gender,
      name: user.name,
      avatarURL: user.avatarURL,
      dailyGoal: user.dailyGoal,
    },
  });
};

export const updateUserController = async (req, res, next) => {
  const userId = req.user._id;
  const userDataToUpdate = req.body;
  const newUserData = await updateUser(userId, userDataToUpdate);

  if (!newUserData)  {
    return createHttpError(404,'The request cannot be processed.');
  }

  res.status(200).json({
    status: 200,
    message: 'Successfully updated user',
    data: {
      email: newUserData.email,
      gender: newUserData.gender,
      name: newUserData.name,
      avatarURL: newUserData.avatarURL,
      dailyGoal: newUserData.dailyGoal,
    },
  });
};

export const updateAvatarController = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    if (!req.file) {
      return next(createHttpError(400, 'Avatar file is required'));
    }
    
    let avatarURL;
    try {
      avatarURL = await saveFileToCloudinary(req.file);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      return next(
        createHttpError(
          503,
          'There was an error connecting to an external service. Please try again later.'
        )
      );
    }
    
    const updatedAvatar = await updateAvatar(userId, avatarURL);
    
    if (!updatedAvatar) {
      return next(createHttpError(400, 'The request cannot be processed.'));
    }
    
    return res.status(200).json({
      status: 200,
      message: 'Successfully updated avatar',
      avatarURL: updatedAvatar.avatarURL,
    });
  } catch (error) {
    return next(error);
  }
};
