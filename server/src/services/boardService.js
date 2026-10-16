import { Tile } from "../models/Tile.js";
import { User } from "../models/User.js";
import { tileIds, TOTAL_TILES } from "../utils/grid.js";
import { sanitizeUser } from "../utils/validation.js";

export const serializeTile = (tile) => ({
  tileId: tile.tileId,
  ownerId: tile.ownerId,
  ownerName: tile.ownerName,
  ownerColor: tile.ownerColor,
  claimedAt: tile.claimedAt
});

export const seedTiles = async () => {
  const operations = tileIds.map((tileId) => ({
    updateOne: {
      filter: { tileId },
      update: { $setOnInsert: { tileId, ownerId: null, ownerName: null, ownerColor: null, claimedAt: null } },
      upsert: true
    }
  }));

  if (operations.length) {
    await Tile.bulkWrite(operations, { ordered: false });
  }
};

export const getBoardState = async () => {
  const tiles = await Tile.find({}).sort({ tileId: 1 }).lean();
  return tiles.map(serializeTile);
};

export const getStats = async () => {
  const claimedTiles = await Tile.countDocuments({ ownerId: { $ne: null } });
  const availableTiles = TOTAL_TILES - claimedTiles;
  return {
    totalTiles: TOTAL_TILES,
    claimedTiles,
    availableTiles,
    percentClaimed: Number(((claimedTiles / TOTAL_TILES) * 100).toFixed(1))
  };
};

export const getLeaderboard = async () => {
  const rows = await Tile.aggregate([
    { $match: { ownerId: { $ne: null } } },
    {
      $group: {
        _id: "$ownerId",
        username: { $first: "$ownerName" },
        color: { $first: "$ownerColor" },
        tilesOwned: { $sum: 1 }
      }
    },
    { $sort: { tilesOwned: -1, username: 1 } },
    { $limit: 10 }
  ]);

  const totalClaimed = rows.reduce((sum, row) => sum + row.tilesOwned, 0);
  return rows.map((row) => ({
    userId: row._id,
    username: row.username,
    color: row.color,
    tilesOwned: row.tilesOwned,
    percentOfClaimed: totalClaimed ? Number(((row.tilesOwned / totalClaimed) * 100).toFixed(1)) : 0
  }));
};

export const upsertUser = async (input) => {
  const user = sanitizeUser(input);
  await User.findOneAndUpdate(
    { userId: user.userId },
    { $set: { username: user.username, color: user.color, lastSeenAt: new Date() } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return user;
};

export const claimTile = async ({ tileId, user }) => {
  const safeUser = await upsertUser(user);
  const claimedAt = new Date();

  const tile = await Tile.findOneAndUpdate(
    { tileId, ownerId: null },
    {
      $set: {
        ownerId: safeUser.userId,
        ownerName: safeUser.username,
        ownerColor: safeUser.color,
        claimedAt
      }
    },
    { new: true }
  ).lean();

  if (!tile) {
    const currentTile = await Tile.findOne({ tileId }).lean();
    return {
      ok: false,
      reason: currentTile ? "Tile is already claimed." : "Tile does not exist.",
      tile: currentTile ? serializeTile(currentTile) : null
    };
  }

  return {
    ok: true,
    tile: serializeTile(tile),
    activity: {
      id: `${tile.tileId}-${claimedAt.getTime()}`,
      tileId: tile.tileId,
      ownerName: tile.ownerName,
      ownerColor: tile.ownerColor,
      claimedAt
    }
  };
};
