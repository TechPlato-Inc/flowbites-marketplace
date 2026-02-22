import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined');
    }
    console.log(`🔗 Connecting to MongoDB: ${uri.replace(/\/\/[^@]+@/, '//***@')}`);
    const conn = await mongoose.connect(uri);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Create indexes on startup
    await createIndexes();
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

async function createIndexes() {
  try {
    // Will be called after models are registered
    console.log('📑 Database indexes will be created by models');
  } catch (error) {
    console.error('Index creation error:', error);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});
