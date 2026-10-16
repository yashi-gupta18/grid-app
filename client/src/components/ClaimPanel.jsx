import { Lock, MousePointer2, Send, ShieldCheck } from "lucide-react";

export default function ClaimPanel({ tile, onClaim, isClaiming, message }) {
  const available = tile && !tile.ownerId;
  return (
    <aside className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/8 text-teal-200">
          {available ? <MousePointer2 size={18} /> : <Lock size={18} />}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">{tile ? tile.tileId : "Select a tile"}</h2>
          <p className="text-sm text-slate-400">{available ? "Ready to claim" : tile?.ownerId ? "Already claimed" : "Pick from the grid"}</p>
        </div>
      </div>
      {tile?.ownerId ? (
        <div className="rounded-xl border border-white/10 bg-slate-950/45 p-4">
          <div className="text-sm text-slate-400">Current owner</div>
          <div className="mt-2 flex items-center gap-2 font-medium text-white">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: tile.ownerColor }} />
            {tile.ownerName}
          </div>
          <p className="mt-3 text-sm text-slate-400">This tile is unavailable. Claims are permanent in this demo.</p>
        </div>
      ) : (
        <button
          disabled={!tile || isClaiming}
          onClick={onClaim}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-300 px-4 py-3 font-semibold text-slate-950 transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {isClaiming ? <ShieldCheck size={18} /> : <Send size={18} />}
          {isClaiming ? "Claiming..." : "Claim tile"}
        </button>
      )}
      {message && <p className="mt-4 rounded-xl border border-white/10 bg-slate-950/40 p-3 text-sm text-slate-200">{message}</p>}
    </aside>
  );
}
