import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import boardRoutes from "./routes/boardRoutes.js";

export const createApp = () => {
  const app = express();

  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(
    cors({
      origin: env.clientOrigins,
      credentials: true
    })
  );
  app.use(express.json({ limit: "32kb" }));
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      limit: 180,
      standardHeaders: true,
      legacyHeaders: false
    })
  );

  app.get("/health", (req, res) => {
    res.json({ ok: true, service: "pixelclaim-api" });
  });

  app.use("/api/board", boardRoutes);
  app.use(notFound);
  app.use(errorHandler);

  return app;
};
