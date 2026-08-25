import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      family: 4
    });
    console.log(`[MongoDB Atlas] Connected successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`[MongoDB Atlas] Connection Error: ${error.message}`);
    console.log('[MongoDB Atlas] Operating in offline fallback mode.');
    return false;
  }
};
