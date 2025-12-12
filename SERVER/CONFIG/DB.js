import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const dbURI = process.env.URI;

export const connectDB = async () => {
  if (!dbURI) {
    console.error("Database connection error: URI not provided");
    process.exit(1);
  }

  try {
    await mongoose.connect(dbURI);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};


