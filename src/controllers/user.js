import createHttpError from 'http-errors';
import {
  getUserById,
  updateAvatarById,
  updateUserById,
} from '../servises/user-servise.js';

export const getUserController = async (req, res, next) => {
  const userId = req.params.id;
        const user = await getUserById(userId);

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found!",
            });
        }

        res.json({
            status: 200,
            message: "Successfully found user!",
            data: user,
        });
};

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

export const updateAvatarController = async (req, res, next) => {};
