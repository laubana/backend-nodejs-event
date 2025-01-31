import cors from "cors";
import { config } from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import corsOptions from "./configs/cors.mjs";
import connect from "./configs/db.mjs";
import event from "./routes/event.mjs";

config();
connect();

const app = express();
app.use(cors(corsOptions));
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use("/", express.static(join(__dirname, "public")));
app.use("/api", event);

mongoose.connection.once("open", () => {
  app.listen(process.env.PORT, () => {
    console.log(`Server launched at port ${process.env.PORT} 🚀`);
  });
});
