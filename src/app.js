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

// Serve các file trong public (tuỳ bạn, nhưng quan trọng là uploads)
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "public", "uploads"))
);


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
