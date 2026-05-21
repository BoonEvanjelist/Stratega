import mongoose from "mongoose";

// NOTE: Do NOT read MONGODB_URI at module level — it throws during Next.js
// static build when env vars are not yet injected. Read it inside dbConnect().

/**
 * Global cached connection object.
 * Prevents Mongoose from opening multiple connections during Next.js
 * hot-reloads in development and across serverless function invocations.
 */
declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

let cached = global._mongooseCache;

if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

async function dbConnect(): Promise<typeof mongoose> {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  // Return existing connection immediately if available
  if (cached.conn) {
    return cached.conn;
  }

  // Kick off a single connection promise and cache it so concurrent callers
  // await the same Promise rather than opening multiple connections.
  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log("✅ MongoDB connected");
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null; // allow retry on next call
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
