import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

/**
 * Start the MongoDB Memory Server
 * @returns {Promise<{uri: string, instance: MongoMemoryServer}>}
 */
export const startMongoMemoryServer = async () => {
  mongoServer = await MongoMemoryServer.create({
    instance: {
      port: 27017, // Use default MongoDB port
      dbName: 'testdb',
    },
  });
  
  const uri = mongoServer.getUri();
  console.log(`MongoDB Memory Server started at: ${uri}`);
  
  return { uri, instance: mongoServer };
};

/**
 * Stop the MongoDB Memory Server
 * @returns {Promise<void>}
 */
export const stopMongoMemoryServer = async () => {
  if (mongoServer) {
    await mongoServer.stop();
    console.log('MongoDB Memory Server stopped');
  }
};

/**
 * Clear all test data from the database
 * @param {import('mongoose').Connection} connection - Mongoose connection
 * @returns {Promise<void>}
 */
export const clearDatabase = async (connection) => {
  if (!connection) return;
  
  const collections = connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};
