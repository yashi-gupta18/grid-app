import { Check, UserRound } from "lucide-react";
import { palette } from "../hooks/useLocalUser";

export default function UserSetup({ onSave }) {
  const submit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSave({
      username: String(form.get("username") || ""),
      color: String(form.get("color") || palette[0])
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#08111f]/88 px-4 backdrop-blur-xl">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-white/12 bg-[#101c2e] p-6 shadow-2xl">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-teal-400 text-slate-950">
            <UserRound size={22} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Choose your mark</h1>
            <p className="text-sm text-slate-400">Anonymous, local to this browser, and editable later.</p>
          </div>
        </div>
        <label className="text-sm font-medium text-slate-200" htmlFor="username">
          Display name
        </label>
        <input
          id="username"
          name="username"
          autoFocus
          minLength={2}
          maxLength={24}
          pattern="[a-zA-Z0-9 _.\-]+"
          required
          placeholder="Alex"
          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none ring-teal-300/40 transition focus:ring-4"
        />
        <div className="mt-5 text-sm font-medium text-slate-200">Tile color</div>
        <div className="mt-3 grid grid-cols-8 gap-2">
          {palette.map((color, index) => (
            <label key={color} className="group relative aspect-square cursor-pointer">
              <input className="peer sr-only" type="radio" name="color" value={color} defaultChecked={index === 0} />
              <span
                className="block h-full rounded-xl border border-white/15 transition peer-checked:scale-95 peer-checked:ring-4 peer-checked:ring-white/35"
                style={{ backgroundColor: color }}
              />
            </label>
          ))}
        </div>
        <button className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-300 px-4 py-3 font-semibold text-slate-950 transition hover:bg-teal-200">
          <Check size={18} />
          Enter the grid
        </button>
      </form>
    </div>
  );
}
