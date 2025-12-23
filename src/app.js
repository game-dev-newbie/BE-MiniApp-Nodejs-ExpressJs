// src/app.js
import express from "express";
import path from "path";
import appRoutes from "./routes/appRoutes.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet, { crossOriginResourcePolicy } from "helmet";

const app = express();

// 1) Helmet: tắt COEP để khỏi dính ERR_BLOCKED_BY_RESPONSE trên vài webview
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    //crossOriginResourcePolicy: fileURLToPath === "true" ? false : { policy: "cross-origin" },
  })
);

// 2) Cho /uploads public, CORS open
app.use(
  "/uploads",
  cors({ origin: "*", methods: ["GET", "OPTIONS"] })
);

app.use(
  "/uploads",
  (req, res, next) => {
    // Cho phép nơi khác (Zalo WebView) nhúng ảnh
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  },
  //express.static(path.resolve(process.cwd(), "public", "uploads"))
);

// 3) CORS strict chỉ cho API
const allowlist = new Set([
  "https://dine-link-dashboard.vercel.app",
  "https://h5.zdn.vn",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5174",
  // thêm origin thực tế bạn log được ở Zalo DevTools nếu khác
]);

app.use(
  "/api",
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowlist.has(origin)) return cb(null, true);
      if (/^https:\/\/.*\.vercel\.app$/.test(origin)) return cb(null, true);

      // quan trọng: log để biết origin thật khi chạy trên Zalo
      console.log("CORS blocked origin:", origin);
      return cb(new Error("CORS blocked: " + origin), false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "ngrok-skip-browser-warning"],
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
