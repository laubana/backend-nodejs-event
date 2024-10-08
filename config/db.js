const mongoose = require("mongoose");
require("dotenv").config();

const dbConfig = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI);
  } catch (err) {
    console.log(err);
  }
};

module.exports = dbConfig;
