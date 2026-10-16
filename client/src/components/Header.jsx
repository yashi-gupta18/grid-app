import { Circle, Pencil, UsersRound, Wifi, WifiOff } from "lucide-react";

export default function Header({ user, onlineCount, connectionState, onEditUser }) {
  const connected = connectionState === "connected";
  return (
    <header className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4 shadow-glow backdrop-blur md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-300 text-slate-950 shadow-glow">
          <Circle fill="currentColor" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-normal text-white">PixelClaim</h1>
          <p className="text-sm text-slate-400">One grid. Everyone leaves a mark.</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <div className={`status-pill ${connected ? "text-teal-200" : "text-rose-200"}`}>
          {connected ? <Wifi size={16} /> : <WifiOff size={16} />}
          {connectionState}
        </div>
        <div className="status-pill text-slate-200">
          <UsersRound size={16} />
          {onlineCount} online
        </div>
        {user && (
          <button onClick={onEditUser} className="status-pill text-slate-100 transition hover:border-white/25">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: user.color }} />
            {user.username}
            <Pencil size={14} />
          </button>
        )}
      </div>
    </header>
  );
}
