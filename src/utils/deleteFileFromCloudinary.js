import { v2 as cloudinary } from 'cloudinary';
import createHttpError from 'http-errors';

export const deleteFileFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    return createHttpError(
      422,
      `Failed to delete photo ${publicId} from Cloudinary:`,
      error.message,
    );
  }
};
