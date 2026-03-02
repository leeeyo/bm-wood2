import mongoose, { Mongoose } from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var mongoose: { conn: Mongoose | null; promise: Promise<Mongoose> | null } | undefined;
}

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local"
    );
  }
  return uri;
}

const MONGODB_URI = getMongoUri();

/**
 * Connects to MongoDB using Mongoose. Caches the connection in development
 * to prevent creating multiple connections during hot reload (Next.js serverless).
 */
async function connectDB(): Promise<Mongoose> {
  if (global.mongoose?.conn) {
    return global.mongoose.conn;
  }

  if (global.mongoose?.promise) {
    return global.mongoose.promise;
  }

  const opts: mongoose.ConnectOptions = {
    bufferCommands: false,
    maxPoolSize: 10,
  };

  global.mongoose = { conn: null, promise: null };
  global.mongoose.promise = mongoose.connect(MONGODB_URI, opts);

  try {
    global.mongoose.conn = await global.mongoose.promise;
  } catch (e) {
    global.mongoose.promise = null;
    throw e;
  }

  return global.mongoose.conn;
}

export default connectDB;
