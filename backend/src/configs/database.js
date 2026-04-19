import mongoose from "mongoose";
import { env, validateEnv } from "./env.js";
import logger from "../utils/logger.js";

export const connectDB = async () => {
  try {
    validateEnv();
    await mongoose.connect(env.mongoUrl);

    logger.info("Connected to MongoDB");
  } catch (error) {
    logger.error("Error connecting to MongoDB", {
      message: error?.message,
    });
    process.exit(1);
  }
};
