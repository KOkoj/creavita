import mongoose from 'mongoose';

// Get MongoDB URI from environment variables with fallback for development
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/image-gallery';
const NODE_ENV = process.env.NODE_ENV || 'development';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Define the cached connection interface
interface CachedConnection {
  conn: mongoose.Mongoose | null;
  promise: Promise<mongoose.Mongoose> | null;
}

// Set mongoose global options
mongoose.set('strictQuery', true);

// Use TypeScript declaration merging to add mongoose to global
declare global {
  var mongoose: CachedConnection | undefined;
}

// Initialize cache, using global if available
let cached: CachedConnection = global.mongoose || { conn: null, promise: null };

// Make the cached connection available globally
if (!global.mongoose) {
  global.mongoose = cached;
}

const connectionOptions = {
  bufferCommands: false,
  maxPoolSize: 10, // Adjust based on your app's needs
  serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
};

/**
 * Global function to connect to MongoDB, which is cached for subsequent calls
 */
async function connectDB() {
  // If we already have a connection, return it
  if (cached.conn) {
    console.log('Using existing MongoDB connection');
    return cached.conn;
  }

  // If a connection is in progress, wait for it
  if (!cached.promise) {
    console.log(`Connecting to MongoDB (${NODE_ENV} environment)...`);
    
    // For retrying connection
    let retries = 3;
    let lastError: Error | null = null;
    
    // Try to connect with retries
    while (retries > 0) {
      try {
        cached.promise = mongoose.connect(MONGODB_URI, connectionOptions);
        break; // Connection successful, exit loop
      } catch (error) {
        lastError = error as Error;
        console.error(`MongoDB connection attempt failed (${retries} retries left):`, error);
        retries--;
        
        // Wait for 2 seconds before retrying
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    // If all retries failed, reject
    if (retries === 0 && lastError) {
      cached.promise = null;
      throw lastError;
    }
  }

  try {
    cached.conn = await cached.promise;
    console.log('Successfully connected to MongoDB');
  } catch (error) {
    cached.promise = null;
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }

  return cached.conn;
}

// Handle graceful shutdown
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    if (cached.conn) {
      await mongoose.disconnect();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    }
  });
}

export default connectDB; 