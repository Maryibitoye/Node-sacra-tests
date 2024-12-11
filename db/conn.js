import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.ATLAS_URI);
    console.log("Database connected successfully");
    return mongoose.connection;
  } catch (error) {
    "Error while connecting to database", error;
  }
};

export default dbConnection;
