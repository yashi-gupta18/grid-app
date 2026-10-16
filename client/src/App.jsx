import { useMemo, useState } from "react";
import ActivityFeed from "./components/ActivityFeed";
import ClaimPanel from "./components/ClaimPanel";
import GridBoard from "./components/GridBoard";
import Header from "./components/Header";
import Leaderboard from "./components/Leaderboard";
import StatsPanel from "./components/StatsPanel";
import UserSetup from "./components/UserSetup";
import { useLocalUser } from "./hooks/useLocalUser";
import { useSocketBoard } from "./hooks/useSocketBoard";

export default function App() {
  const { user, saveUser, resetUser } = useLocalUser();
  const board = useSocketBoard(user);
  const [selectedTileId, setSelectedTileId] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [message, setMessage] = useState("");

  const selectedTile = useMemo(() => board.tilesById.get(selectedTileId), [board.tilesById, selectedTileId]);

  const handleClaim = async () => {
    if (!selectedTile || selectedTile.ownerId || claiming) return;
    setClaiming(true);
    setMessage("");
    const result = await board.claimTile(selectedTile.tileId);
    setClaiming(false);
    setMessage(result.ok ? `Success. ${selectedTile.tileId} is yours.` : result.error || "Claim rejected.");
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#07101d] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.20),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.92),rgba(2,6,23,0.98))]" />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <Header user={user} onlineCount={board.onlineCount} connectionState={board.connectionState} onEditUser={resetUser} />
        <StatsPanel stats={board.stats} />
        {(board.lastError || board.connectionState !== "connected") && (
          <div className="rounded-2xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
            {board.lastError || "Connection is not live. Claims will be available when the socket reconnects."}
          </div>
        )}
        <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
          <GridBoard tiles={board.tiles} selectedTileId={selectedTileId} onSelect={setSelectedTileId} />
          <div className="space-y-5">
            <ClaimPanel tile={selectedTile} onClaim={handleClaim} isClaiming={claiming} message={message} />
            <Leaderboard rows={board.leaderboard} />
            <ActivityFeed items={board.activity} />
          </div>
        </div>
      </div>
      {!user && <UserSetup onSave={saveUser} />}
    </main>
  );
}
