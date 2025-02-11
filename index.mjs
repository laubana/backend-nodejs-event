import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import url from "url";

import corsConfig from "./configs/corsConfig.mjs";
import dbConfig from "./configs/dbConfig.mjs";
import event from "./routes/event.mjs";

dotenv.config();
dbConfig.connect();

const app = express();
app.use(cors(corsConfig.corsOptions));
app.use(express.json());
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/", express.static(path.join(__dirname, "public")));
app.use(
  "/favicon.ico",
  express.static(path.join(__dirname, "public", "favicon.ico"))
);
app.use("/api", event);

mongoose.connection.once("open", () => {
  app.listen(process.env.PORT, () => {
    console.log(`Server launched at port ${process.env.PORT} 🚀`);
  });
});
