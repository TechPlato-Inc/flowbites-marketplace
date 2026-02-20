import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Options removed as they're now defaults in Mongoose 6+
    });

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
