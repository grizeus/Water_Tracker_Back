import createHttpError from 'http-errors';
import {
  getUserById,
  updateAvatar,
  updateUser,
} from '../services/user-servise.js';

import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';

export const getUserController = async (req, res, next) => {
  const userId = req.user._id;
  const user = await getUserById(userId);
  console.log('hello');

  if (!user) {
    return res.status(400).json({
      status: 400,
      message: 'The request cannot be processed.',
    });
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

  if (!newUserData) {
    return res.status(400).json({
      status: 400,
      message: 'The request cannot be processed.',
    });
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
  const userId = req.user._id;
  let avatarURL;
  if (req.file) {
    try {
      avatarURL = await saveFileToCloudinary(req.file);
    } catch {
      return next(
        createHttpError(
          503,
          'There was an error connecting to an external service. Please try again later.',
        ),
      );
    }
  }

  if (!req.file) {
    return next(createHttpError(400, 'Avatar URL is required'));
  }

  const updatedAvatar = await updateAvatar(userId, avatarURL);

  if (!updatedAvatar) {
    return res.status(400).json({
      message: 'The request cannot be processed.',
    });
  }

  return res.status(200).json({
    status: 200,
    message: 'Successfully updated avatar',
    avatarURL: updatedAvatar.avatarURL,
  });
};
