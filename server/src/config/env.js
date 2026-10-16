import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

dotenv.config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

const splitOrigins = (value) =>
  value
    ? value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [];

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  mongodbUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/pixelclaim",
  clientOrigins: splitOrigins(process.env.CLIENT_ORIGIN || "http://localhost:5173"),
  claimCooldownMs: Number(process.env.CLAIM_COOLDOWN_MS || 1200)
};

export const isProduction = env.nodeEnv === "production";
