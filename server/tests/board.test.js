import http from "http";
import path from "path";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Server } from "socket.io";
import { io as Client } from "socket.io-client";
import request from "supertest";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app.js";
import { connectDatabase, disconnectDatabase } from "../src/config/db.js";
import { Tile } from "../src/models/Tile.js";
import { claimTile, getBoardState, seedTiles } from "../src/services/boardService.js";
import { registerSocketHandlers } from "../src/sockets/socketHandlers.js";

process.env.MONGOMS_DOWNLOAD_DIR = path.resolve(".mongodb-memory-server");

const userA = { userId: "user-alpha-123", username: "Alex", color: "#14b8a6" };
const userB = { userId: "user-bravo-123", username: "Blair", color: "#38bdf8" };

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await connectDatabase(mongo.getUri());
});

afterAll(async () => {
  await disconnectDatabase();
  await mongo?.stop();
});

beforeEach(async () => {
  await mongoose.connection.db.dropDatabase();
  await seedTiles();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("board persistence and claims", () => {
  it("seeds exactly 625 stable tiles", async () => {
    const tiles = await getBoardState();

    expect(tiles).toHaveLength(625);
    expect(tiles[0].tileId).toBe("A-001");
    expect(tiles[624].tileId).toBe("Y-025");
  });

  it("allows a valid user to claim an unclaimed tile", async () => {
    const result = await claimTile({ tileId: "A-001", user: userA });

    expect(result.ok).toBe(true);
    expect(result.tile.ownerId).toBe(userA.userId);
    expect(result.tile.ownerName).toBe(userA.username);
  });

  it("rejects a second claim for an already-owned tile", async () => {
    await claimTile({ tileId: "A-002", user: userA });
    const result = await claimTile({ tileId: "A-002", user: userB });

    expect(result.ok).toBe(false);
    expect(result.tile.ownerId).toBe(userA.userId);
  });

  it("allows exactly one winner during simultaneous claims for the same tile", async () => {
    const attempts = await Promise.all([
      claimTile({ tileId: "A-003", user: userA }),
      claimTile({ tileId: "A-003", user: userB })
    ]);

    expect(attempts.filter((attempt) => attempt.ok)).toHaveLength(1);
    expect(await Tile.countDocuments({ tileId: "A-003", ownerId: { $ne: null } })).toBe(1);
  });

  it("rejects invalid tile IDs through the API", async () => {
    const app = createApp();

    const response = await request(app).post("/api/board/claim").send({ tileId: "NOPE", user: userA });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/Invalid tile ID/);
  });

  it("does not produce a false success when the database update fails", async () => {
    vi.spyOn(Tile, "findOneAndUpdate").mockImplementationOnce(() => {
      throw new Error("database unavailable");
    });

    await expect(claimTile({ tileId: "A-004", user: userA })).rejects.toThrow("database unavailable");
    const tile = await Tile.findOne({ tileId: "A-004" }).lean();
    expect(tile.ownerId).toBeNull();
  });

  it("keeps ownership after reconnecting to the same database", async () => {
    await claimTile({ tileId: "A-005", user: userA });

    await disconnectDatabase();
    await connectDatabase(mongo.getUri());

    const tile = await Tile.findOne({ tileId: "A-005" }).lean();
    expect(tile.ownerId).toBe(userA.userId);
  });
});

describe("socket behavior", () => {
  let httpServer;
  let io;
  let port;

  beforeEach(async () => {
    const app = createApp();
    httpServer = http.createServer(app);
    io = new Server(httpServer, { cors: { origin: "*" } });
    registerSocketHandlers(io);
    await new Promise((resolve) => httpServer.listen(0, resolve));
    port = httpServer.address().port;
  });

  afterEach(async () => {
    io.close();
    if (httpServer.listening) {
      await new Promise((resolve) => httpServer.close(resolve));
    }
  });

  const connectClient = () =>
    new Promise((resolve) => {
      const client = Client(`http://localhost:${port}`, {
        transports: ["websocket"],
        forceNew: true
      });
      client.on("board:state", (state) => resolve({ client, state }));
    });

  it("sends current board state to a newly connected client", async () => {
    const { client, state } = await connectClient();

    expect(state.tiles).toHaveLength(625);
    expect(state.stats.totalTiles).toBe(625);
    client.close();
  });

  it("broadcasts claim updates to socket clients", async () => {
    const { client: clientA } = await connectClient();
    const { client: clientB } = await connectClient();
    await Promise.all([
      new Promise((resolve) => clientA.emit("user:join", userA, resolve)),
      new Promise((resolve) => clientB.emit("user:join", userB, resolve))
    ]);

    const received = new Promise((resolve) => clientB.once("tile:claimed", resolve));
    const ack = await new Promise((resolve) => clientA.emit("tile:claim", { tileId: "A-006", user: userA }, resolve));
    const tile = await received;

    expect(ack.ok).toBe(true);
    expect(tile.tileId).toBe("A-006");
    expect(tile.ownerId).toBe(userA.userId);
    clientA.close();
    clientB.close();
  });
});
