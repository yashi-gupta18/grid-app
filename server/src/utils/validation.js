import { z } from "zod";
import { isValidTileId } from "./grid.js";

export const allowedColors = [
  "#14b8a6",
  "#38bdf8",
  "#818cf8",
  "#f472b6",
  "#fb7185",
  "#f59e0b",
  "#84cc16",
  "#a78bfa"
];

const usernameSchema = z
  .string()
  .trim()
  .min(2, "Username must be at least 2 characters.")
  .max(24, "Username must be 24 characters or fewer.")
  .regex(/^[a-zA-Z0-9 _.-]+$/, "Use letters, numbers, spaces, dots, hyphens, or underscores.");

export const userSchema = z.object({
  userId: z.string().trim().min(8).max(80),
  username: usernameSchema,
  color: z.string().refine((color) => allowedColors.includes(color), "Choose a supported color.")
});

export const claimSchema = z.object({
  tileId: z.string().refine(isValidTileId, "Invalid tile ID."),
  user: userSchema
});

export const sanitizeUser = (input) => {
  const user = userSchema.parse(input);
  return {
    userId: user.userId,
    username: user.username.replace(/\s+/g, " "),
    color: user.color
  };
};

export const formatZodError = (error) => error.errors?.[0]?.message || "Invalid request.";
