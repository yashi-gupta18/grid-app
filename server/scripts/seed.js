import { connectDatabase, disconnectDatabase } from "../src/config/db.js";
import { seedTiles, getStats } from "../src/services/boardService.js";

try {
  await connectDatabase();
  await seedTiles();
  const stats = await getStats();
  console.log(`Seed complete: ${stats.totalTiles} tiles, ${stats.claimedTiles} already claimed.`);
} catch (error) {
  console.error("Seed failed:", error);
  process.exitCode = 1;
} finally {
  await disconnectDatabase();
}
