import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true, trim: true, maxlength: 24 },
    color: { type: String, required: true },
    lastSeenAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
