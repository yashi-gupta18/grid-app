import { getBoardState, getLeaderboard, getStats, claimTile, upsertUser } from "../services/boardService.js";
import { claimSchema, formatZodError, userSchema } from "../utils/validation.js";
import { env } from "../config/env.js";

const onlineUsers = new Map();
const claimCooldowns = new Map();
const recentActivity = [];

const pushActivity = (activity) => {
  recentActivity.unshift(activity);
  recentActivity.splice(20);
};

const emitAggregates = async (io) => {
  const [stats, leaderboard] = await Promise.all([getStats(), getLeaderboard()]);
  io.emit("stats:updated", stats);
  io.emit("leaderboard:updated", leaderboard);
};

const emitUsersCount = (io) => {
  io.emit("users:count", onlineUsers.size);
};

const sendInitialState = async (socket) => {
  const [tiles, stats, leaderboard] = await Promise.all([getBoardState(), getStats(), getLeaderboard()]);
  socket.emit("board:state", { tiles, stats, leaderboard, activity: recentActivity });
};

export const registerSocketHandlers = (io) => {
  io.on("connection", async (socket) => {
    try {
      await sendInitialState(socket);
    } catch (error) {
      socket.emit("server:error", { message: "Unable to load the board right now." });
    }

    socket.on("board:request", async () => {
      try {
        await sendInitialState(socket);
      } catch (error) {
        socket.emit("server:error", { message: "Unable to refresh the board." });
      }
    });

    socket.on("user:join", async (payload, ack) => {
      try {
        const parsed = userSchema.safeParse(payload);
        if (!parsed.success) {
          const message = formatZodError(parsed.error);
          ack?.({ ok: false, error: message });
          return socket.emit("server:error", { message });
        }

        const user = await upsertUser(parsed.data);
        onlineUsers.set(socket.id, user.userId);
        ack?.({ ok: true, user });
        emitUsersCount(io);
      } catch (error) {
        ack?.({ ok: false, error: "Unable to join." });
        socket.emit("server:error", { message: "Unable to join." });
      }
    });

    socket.on("tile:claim", async (payload, ack) => {
      try {
        const parsed = claimSchema.safeParse(payload);
        if (!parsed.success) {
          const message = formatZodError(parsed.error);
          ack?.({ ok: false, error: message });
          return socket.emit("tile:claim-rejected", { error: message });
        }

        const lastClaim = claimCooldowns.get(parsed.data.user.userId) || 0;
        const remaining = env.claimCooldownMs - (Date.now() - lastClaim);
        if (remaining > 0) {
          const message = `Please wait ${Math.ceil(remaining / 1000)}s before claiming another tile.`;
          ack?.({ ok: false, error: message });
          return socket.emit("tile:claim-rejected", { error: message, tileId: parsed.data.tileId });
        }

        const result = await claimTile(parsed.data);
        if (!result.ok) {
          ack?.({ ok: false, error: result.reason, tile: result.tile });
          return socket.emit("tile:claim-rejected", { error: result.reason, tile: result.tile });
        }

        claimCooldowns.set(parsed.data.user.userId, Date.now());
        pushActivity(result.activity);
        ack?.({ ok: true, tile: result.tile });
        io.emit("tile:claimed", result.tile);
        io.emit("activity:new", result.activity);
        await emitAggregates(io);
      } catch (error) {
        ack?.({ ok: false, error: "Claim failed. Please try again." });
        socket.emit("server:error", { message: "Claim failed. Please try again." });
      }
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(socket.id);
      emitUsersCount(io);
    });
  });
};
