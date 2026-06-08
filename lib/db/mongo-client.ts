// lib/db/mongo-client.ts — native MongoClient promise for the Auth.js adapter.
// Kept separate from the Mongoose connection (lib/db/mongoose.ts): the adapter
// speaks the native driver, Mongoose manages the app's domain models.
// Lazy + cached so the client isn't constructed at import time (keeps `next build`
// working without MONGODB_URI) and is reused across HMR / warm invocations.

import { MongoClient } from "mongodb";

let clientPromise: Promise<MongoClient> | undefined;

function createClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not defined. Set it in .env.local (see .env.example).",
    );
  }

  if (process.env.NODE_ENV === "development") {
    const g = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };
    if (!g._mongoClientPromise) {
      g._mongoClientPromise = new MongoClient(uri).connect();
    }
    return g._mongoClientPromise;
  }

  return new MongoClient(uri).connect();
}

/** Lazily creates (once) and returns the shared MongoClient promise. */
export function getMongoClientPromise(): Promise<MongoClient> {
  if (!clientPromise) clientPromise = createClientPromise();
  return clientPromise;
}
