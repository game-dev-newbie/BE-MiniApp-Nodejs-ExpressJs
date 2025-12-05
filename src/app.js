// src/app.js
import express from "express";
import path from "path";
import appRoutes from "./routes/appRoutes.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet";

const app = express();

app.use(helmet());
app.use(cors({ origin: "*" })); // sau này refine origin cũng được

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/static", express.static(path.join(__dirname, "public")));

app.use("/api", appRoutes); // => /api/v1/...

app.get("/", (req, res) => {
  res.send("Welcome to the Restaurant Booking API");
});

// 404
app.use(notFound);

// middleware xử lý lỗi CUỐI CÙNG
app.use(errorHandler);

// ... middlewares, routes, error handler

export default app;
