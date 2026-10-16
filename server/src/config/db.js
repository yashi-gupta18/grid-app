import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDatabase = async (uri = env.mongodbUri) => {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000
  });
  return mongoose.connection;
};

export const disconnectDatabase = async () => {
  await mongoose.disconnect();
};
