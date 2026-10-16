export const GRID_SIZE = 25;
export const TOTAL_TILES = GRID_SIZE * GRID_SIZE;

export const tileIds = Array.from({ length: TOTAL_TILES }, (_, index) => {
  const row = String.fromCharCode(65 + Math.floor(index / GRID_SIZE));
  const column = String(index % GRID_SIZE + 1).padStart(3, "0");
  return `${row}-${column}`;
});

export const isValidTileId = (tileId) => tileIds.includes(tileId);
