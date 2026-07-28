import mongoose from "mongoose";
import config from "./index";

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.database.uri, {
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 10000,
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on("error", (error) => {
      console.error("MongoDB connection error:", error);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected. Attempting to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("MongoDB reconnected successfully");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed due to app termination");
      process.exit(0);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    // Retry after 5 seconds
    console.log("Retrying connection in 5 seconds...");
    setTimeout(() => {
      connectDB();
    }, 5000);
  }
};

export default connectDB;
