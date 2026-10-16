import mongoose from "mongoose";

const tileSchema = new mongoose.Schema(
  {
    tileId: { type: String, required: true, unique: true, index: true },
    ownerId: { type: String, default: null, index: true },
    ownerName: { type: String, default: null },
    ownerColor: { type: String, default: null },
    claimedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

tileSchema.index({ ownerId: 1, claimedAt: -1 });

export const Tile = mongoose.model("Tile", tileSchema);
