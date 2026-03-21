import "express-async-errors";
import fs from "node:fs";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "node:path";
import { env } from "./config/env.js";
import { reqLog } from "./middleware/req-log.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFound } from "./middleware/not-found.js";
import apiRouter from "./routes/index.js";

fs.mkdirSync(env.staticDir, { recursive: true });

export const app = express();

app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(reqLog);
app.use("/uploads", express.static(path.resolve(env.staticDir)));
app.use("/api", apiRouter);
app.use(notFound);
app.use(errorHandler);
