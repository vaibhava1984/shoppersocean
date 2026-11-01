const zones = [
  { icon: "📚", name: "Flipbook World", tone: "from-sky-500 to-blue-700", note: "Connects to existing Read E-books" },
  { icon: "🎮", name: "Entertainment Arena", tone: "from-violet-500 to-indigo-700", note: "Seven existing games" },
  { icon: "🎓", name: "Learning Academy", tone: "from-emerald-500 to-teal-700", note: "English Master Quiz remains unchanged" },
  { icon: "💡", name: "Digital Discovery Hub", tone: "from-cyan-500 to-blue-700", note: "Proposed zone name" },
  { icon: "🕵️", name: "Mystery Mansion", tone: "from-slate-600 to-slate-900" },
  { icon: "🧩", name: "Puzzle Universe", tone: "from-fuchsia-500 to-purple-700" },
  { icon: "🌍", name: "World Explorer", tone: "from-green-500 to-emerald-700" },
  { icon: "😂", name: "Laughter Lounge", tone: "from-amber-400 to-orange-600" },
  { icon: "🎨", name: "Creative Studio", tone: "from-pink-500 to-rose-700" },
  { icon: "🚀", name: "Future World", tone: "from-indigo-500 to-blue-800" },
  { icon: "🧠", name: "Mind Lab", tone: "from-teal-500 to-cyan-800" },
  { icon: "🏆", name: "Brain Battle Arena", tone: "from-yellow-500 to-amber-700", note: "Proposed zone name" },
  { icon: "🔦", name: "Thriller Zone", tone: "from-zinc-600 to-neutral-950" },
  { icon: "🌟", name: "World Records Arena", tone: "from-orange-500 to-red-700" },
  { icon: "🪐", name: "Space Odyssey", tone: "from-violet-600 to-slate-950" },
  { icon: "🎭", name: "Roleplay Theatre", tone: "from-rose-500 to-pink-800" },
  { icon: "👁️", name: "Visual Wonders", tone: "from-blue-500 to-indigo-800" },
  { icon: "🛠️", name: "Creative Crafts & DIY", tone: "from-lime-500 to-green-700", note: "Proposed zone name" },
  { icon: "🏝️", name: "Adventure Island", tone: "from-cyan-500 to-teal-800" },
  { icon: "🎁", name: "Surprise Station", tone: "from-red-500 to-fuchsia-700" },
];

export default function AdminZonePreview() {
  return (
    <section aria-label="Admin-only 20 zone layout preview" className="relative overflow-hidden border-y border-indigo-200 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 py-9 sm:py-12">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 sm:mb-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300 sm:text-xs">Private workspace · Admin only</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">Explore 20 Worlds</h2>
            <p className="mt-2 max-w-xl text-xs leading-5 text-slate-300 sm:text-sm">Your new Shoppers Ocean zone layout. These sections are a private design preview and are not available to visitors yet.</p>
          </div>
          <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-200">20 zones · Preview</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {zones.map((zone, index) => (
            <div key={zone.name} className="group relative min-h-[112px] overflow-hidden rounded-2xl border border-white/15 bg-white/[0.06] p-3 shadow-lg backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-white/35 hover:bg-white/[0.11] sm:min-h-[132px] sm:p-4">
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${zone.tone}`} />
              <div className="flex items-start justify-between gap-1">
                <span className="text-2xl drop-shadow sm:text-3xl" aria-hidden="true">{zone.icon}</span>
                <span className="rounded-full border border-white/15 bg-black/20 px-1.5 py-1 text-[8px] font-bold uppercase tracking-wide text-slate-200 sm:text-[9px]">#{String(index + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="mt-3 text-xs font-extrabold leading-4 text-white sm:text-sm sm:leading-5">{zone.name}</h3>
              <p className="mt-1 text-[9px] font-semibold leading-4 text-cyan-200/90 sm:text-[10px]">{zone.note ?? "Under construction"}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-center text-[10px] font-medium text-slate-400">Private admin preview only · No unfinished zone is exposed publicly</p>
      </div>
    </section>
  );
}
