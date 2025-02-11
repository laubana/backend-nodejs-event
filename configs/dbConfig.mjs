import mongoose from "mongoose";

import "../models/Event.mjs";

const connect = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
  } catch (error) {
    console.error(error);

    console.error("Failed to connect to DB 🚨");
  }
};

export default { connect };
