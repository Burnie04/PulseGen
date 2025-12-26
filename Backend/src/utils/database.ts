import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('❌ MONGODB_URI is not defined');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri, {
      autoIndex: true,
    });

    console.log('✅ MongoDB connected');

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB runtime error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });
    
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🛑 MongoDB connection closed');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};
