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
const allowlist = new Set([
  "https://dine-link-dashboard.vercel.app",
  "https://h5.zdn.vn", // thường gặp với Zalo MiniApp webview
  "zbrowser://h5.zdn.vn", // một số môi trường Zalo có thể dùng scheme khác
  "http://localhost:3000",
  "http://localhost:5173",
]);

app.use(
  cors({
    origin: (origin, cb) => {
      // Postman/server-to-server thường không có Origin
      if (!origin) return cb(null, true);

      // allow exact match
      if (allowlist.has(origin)) return cb(null, true);

      // allow preview vercel (tuỳ bạn có cần không)
      if (/^https:\/\/.*\.vercel\.app$/.test(origin)) return cb(null, true);

      // một số môi trường Zalo có thể dùng scheme khác (nếu bạn log thấy)
      if (origin === "zbrowser://h5.zdn.vn") return cb(null, true);

      return cb(new Error("CORS blocked: " + origin), false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
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
