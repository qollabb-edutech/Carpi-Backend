import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import Index from "./routes/index.js";
import { syncDatabase } from "./controller/recognition/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cookieParser(process.env.COOKIE_SECRET || "carpi-cookie-secret"));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3005",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const uploadDir = process.env.UPLOAD_DIR || "uploads";
app.use("/uploads", express.static(path.join(__dirname, uploadDir)));

app.use("/api", Index);

try {
  await syncDatabase();
  console.log("Database synced");
} catch (err) {
  console.error("Database sync failed:", err.message);
}

export default app;
