import http from "http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { seedTiles } from "./services/boardService.js";
import { registerSocketHandlers } from "./sockets/socketHandlers.js";

const start = async () => {
  try {
    await connectDatabase();
    await seedTiles();

    const app = createApp();
    const httpServer = http.createServer(app);
    const io = new Server(httpServer, {
      cors: {
        origin: env.clientOrigins,
        credentials: true
      },
      transports: ["websocket", "polling"]
    });

    registerSocketHandlers(io);

    httpServer.listen(env.port, () => {
      console.log(`PixelClaim API listening on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start PixelClaim API:", error.message);
    process.exit(1);
  }
};

start();
