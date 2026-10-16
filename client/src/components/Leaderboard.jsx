import { Trophy } from "lucide-react";

export default function Leaderboard({ rows }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
      <div className="mb-4 flex items-center gap-2 text-white">
        <Trophy size={18} />
        <h2 className="font-semibold">Leaderboard</h2>
      </div>
      <div className="space-y-3">
        {rows.length === 0 && <p className="text-sm text-slate-400">No claims yet. First mark is still waiting.</p>}
        {rows.map((row, index) => (
          <div key={row.userId} className="flex items-center justify-between gap-3 text-sm">
            <div className="flex min-w-0 items-center gap-2">
              <span className="w-5 text-slate-500">{index + 1}</span>
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: row.color }} />
              <span className="truncate text-slate-100">{row.username}</span>
            </div>
            <div className="text-right">
              <div className="font-semibold text-white">{row.tilesOwned}</div>
              <div className="text-xs text-slate-500">{row.percentOfClaimed}%</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
