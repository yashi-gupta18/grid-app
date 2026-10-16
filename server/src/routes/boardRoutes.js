import { Router } from "express";
import { getBoardState, getLeaderboard, getStats, claimTile } from "../services/boardService.js";
import { claimSchema, formatZodError } from "../utils/validation.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const [tiles, stats, leaderboard] = await Promise.all([getBoardState(), getStats(), getLeaderboard()]);
    res.json({ tiles, stats, leaderboard });
  } catch (error) {
    next(error);
  }
});

router.post("/claim", async (req, res, next) => {
  try {
    const parsed = claimSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: formatZodError(parsed.error) });
    }

    const result = await claimTile(parsed.data);
    if (!result.ok) {
      return res.status(409).json(result);
    }
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
