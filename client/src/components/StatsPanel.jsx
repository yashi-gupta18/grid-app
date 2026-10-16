import { Activity, Grid3X3, Percent, Sparkles } from "lucide-react";

const items = [
  ["Total", "totalTiles", Grid3X3],
  ["Claimed", "claimedTiles", Sparkles],
  ["Available", "availableTiles", Activity],
  ["Complete", "percentClaimed", Percent]
];

export default function StatsPanel({ stats }) {
  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map(([label, key, Icon]) => (
        <div key={key} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
          <div className="mb-3 flex items-center justify-between text-slate-400">
            <span className="text-sm">{label}</span>
            <Icon size={17} />
          </div>
          <div className="text-2xl font-semibold text-white">
            {key === "percentClaimed" ? `${stats[key]}%` : stats[key]}
          </div>
        </div>
      ))}
    </section>
  );
}
