import cors from "cors";
import { config } from "dotenv";
import express from "express";
import mongoose from "mongoose";

import corsOptions from "./configs/cors.mjs";
import connect from "./configs/db.mjs";
import event from "./routes/event.mjs";

config();
connect();

const app = express();
app.use(cors(corsOptions));
app.use(express.json());

app.use("/api", event);

mongoose.connection.once("open", () => {
  app.listen(process.env.PORT, () => {
    console.log(`Server launched at port ${process.env.PORT} 🚀`);
  });
});
