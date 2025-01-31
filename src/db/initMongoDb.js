import mongoose from 'mongoose';

import { getEnvVar } from '../utils/getEnvVar.js';

const user = getEnvVar('MONGODB_USER');
const password = getEnvVar('MONGODB_PASSWORD');
const url = getEnvVar('MONGODB_URL');
const name = getEnvVar('MONGODB_DB');

export const initMongoDb = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${user}:${password}@${url}/${name}?retryWrites=true&w=majority&appName=Cluster0`,
    );
    console.log('database is connect');
  } catch (error) {
    console.log(`Error ${error.message}`);
    throw error;
  }
};
