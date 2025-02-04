import createHttpError from 'http-errors';
import {
  getUserById,
  updateAvatarById,
  updateUserById,
} from '../servises/user-servise.js';



export const getUserController = async (req, res, next) => {};

export const updateUserController = async (req, res, next) => {
  const { id: userId } = req.params;
  const userDataToUpdate = req.body;
  // TODO: get info about userID session
  // const { id: userId } = req.user;
  const newUserData = await updateUserById(userId, userDataToUpdate);

  if (!newUserData) throw new createHttpError(404, 'User not found');

  res.status(200).json({
    status: 200,
    message: 'Successfully updated user',
    data: newUserData,
  });
};

export const updateAvatarController = async (req, res, next) => {
  try {
    const { id: userId } = req.params;
    const { avatarURL } = req.body;

    if (!avatarURL) {
      throw new createHttpError(400, 'Avatar URL is required');
    }

    const updatedUser = await updateAvatarById(userId, avatarURL);

    if (!updatedUser) {
      throw new createHttpError(404, 'User not found');
    }

    res.status(200).json({
      status: 200,
      message: 'Successfully updated avatar',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
