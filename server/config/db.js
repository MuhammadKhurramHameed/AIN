import mongoose from 'mongoose';

// Disable query buffering so requests fail/fallback immediately when DB is offline
mongoose.set('bufferCommands', false);

export const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.log('[MongoDB Atlas] No URI provided. Operating in offline fallback mode.');
    return false;
  }
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2500,
      family: 4
    });
    console.log(`[MongoDB Atlas] Connected successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`[MongoDB Atlas] Offline fallback active (${error.message}).`);
    return false;
  }
};
