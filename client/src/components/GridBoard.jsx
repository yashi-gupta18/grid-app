export default function GridBoard({ tiles, selectedTileId, onSelect }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0a1424]/90 p-3 shadow-2xl">
      <div className="grid aspect-square grid-cols-25 gap-[3px]">
        {tiles.map((tile) => {
          const claimed = Boolean(tile.ownerId);
          const selected = selectedTileId === tile.tileId;
          return (
            <button
              key={tile.tileId}
              title={claimed ? `${tile.tileId}: ${tile.ownerName}` : `${tile.tileId}: available`}
              onClick={() => onSelect(tile.tileId)}
              className={`tile ${claimed ? "tile-claimed" : "tile-open"} ${selected ? "tile-selected" : ""}`}
              style={claimed ? { backgroundColor: tile.ownerColor } : undefined}
              aria-label={claimed ? `${tile.tileId} owned by ${tile.ownerName}` : `${tile.tileId} available`}
            />
          );
        })}
      </div>
    </section>
  );
}
