import mongoose from "mongoose";

import "../models/Event.mjs";

export default async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
  } catch (error) {
    console.error(error);

    console.error("Failed to connect to DB 🚨");
  }
};
