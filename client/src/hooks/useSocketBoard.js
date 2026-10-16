import { useEffect, useMemo, useState } from "react";
import { socket } from "../services/socket";

const initialStats = {
  totalTiles: 625,
  claimedTiles: 0,
  availableTiles: 625,
  percentClaimed: 0
};

export const useSocketBoard = (user) => {
  const [tiles, setTiles] = useState([]);
  const [stats, setStats] = useState(initialStats);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activity, setActivity] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [connectionState, setConnectionState] = useState(socket.connected ? "connected" : "offline");
  const [lastError, setLastError] = useState("");

  useEffect(() => {
    const onConnect = () => {
      setConnectionState("connected");
      setLastError("");
      if (user) {
        socket.emit("user:join", user);
      }
      socket.emit("board:request");
    };

    const onDisconnect = () => setConnectionState("offline");
    const onReconnectAttempt = () => setConnectionState("reconnecting");
    const onBoardState = (payload) => {
      setTiles(payload.tiles || []);
      setStats(payload.stats || initialStats);
      setLeaderboard(payload.leaderboard || []);
      setActivity(payload.activity || []);
    };
    const onTileClaimed = (tile) => {
      setTiles((current) => current.map((item) => (item.tileId === tile.tileId ? tile : item)));
    };
    const onActivity = (item) => setActivity((current) => [item, ...current].slice(0, 20));
    const onServerError = (payload) => setLastError(payload?.message || "Something went wrong.");

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.io.on("reconnect_attempt", onReconnectAttempt);
    socket.on("board:state", onBoardState);
    socket.on("tile:claimed", onTileClaimed);
    socket.on("stats:updated", setStats);
    socket.on("leaderboard:updated", setLeaderboard);
    socket.on("activity:new", onActivity);
    socket.on("users:count", setOnlineCount);
    socket.on("server:error", onServerError);

    if (!socket.connected) {
      socket.connect();
    } else {
      onConnect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.io.off("reconnect_attempt", onReconnectAttempt);
      socket.off("board:state", onBoardState);
      socket.off("tile:claimed", onTileClaimed);
      socket.off("stats:updated", setStats);
      socket.off("leaderboard:updated", setLeaderboard);
      socket.off("activity:new", onActivity);
      socket.off("users:count", setOnlineCount);
      socket.off("server:error", onServerError);
    };
  }, [user]);

  const tilesById = useMemo(() => new Map(tiles.map((tile) => [tile.tileId, tile])), [tiles]);

  const claimTile = (tileId) =>
    new Promise((resolve) => {
      if (!user) {
        resolve({ ok: false, error: "Choose a username and color first." });
        return;
      }
      socket.emit("tile:claim", { tileId, user }, (response) => {
        if (!response?.ok && response?.tile) {
          setTiles((current) => current.map((item) => (item.tileId === response.tile.tileId ? response.tile : item)));
        }
        resolve(response || { ok: false, error: "No response from server." });
      });
    });

  return {
    tiles,
    tilesById,
    stats,
    leaderboard,
    activity,
    onlineCount,
    connectionState,
    lastError,
    claimTile
  };
};
