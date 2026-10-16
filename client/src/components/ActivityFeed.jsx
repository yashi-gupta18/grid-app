import { Clock3 } from "lucide-react";

export default function ActivityFeed({ items }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
      <div className="mb-4 flex items-center gap-2 text-white">
        <Clock3 size={18} />
        <h2 className="font-semibold">Activity</h2>
      </div>
      <div className="space-y-3">
        {items.length === 0 && <p className="text-sm text-slate-400">Successful claims will appear here.</p>}
        {items.map((item) => (
          <div key={item.id} className="text-sm text-slate-300">
            <span className="inline-block h-2 w-2 rounded-full align-middle" style={{ backgroundColor: item.ownerColor }} />{" "}
            <span className="font-medium text-white">{item.ownerName}</span> claimed tile{" "}
            <span className="font-medium text-teal-200">{item.tileId}</span>.
          </div>
        ))}
      </div>
    </section>
  );
}
