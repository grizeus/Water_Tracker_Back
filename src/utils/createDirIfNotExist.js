import * as fs from 'node:fs/promises';

export const createDirIfNotExist = async (url) => {
  try {
    await fs.access(url);
  } catch (er) {
    if (er.code === 'ENOENT') {
      await fs.mkdir(url);
    }
  }
};
