export default function SkeletonCard() {
  return (
    <div className="bg-white/90 dark:bg-slate-900/90 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-700/50 overflow-hidden animate-pulse">
      {/* Header band */}
      <div className="p-4 sm:p-6 bg-slate-100 dark:bg-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-md bg-slate-300 dark:bg-slate-600" />
          <div className="h-3 w-24 rounded bg-slate-300 dark:bg-slate-600" />
        </div>
        <div className="h-6 w-3/4 rounded-lg bg-slate-300 dark:bg-slate-600 mb-2" />
        <div className="h-4 w-1/2 rounded bg-slate-300 dark:bg-slate-600 mb-4" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-7 w-20 rounded-lg bg-slate-300/70 dark:bg-slate-600/70" />
          ))}
        </div>
      </div>
      {/* Body */}
      <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
        <div>
          <div className="h-3 w-20 rounded mb-4 bg-slate-200 dark:bg-slate-700" />
          <div className="space-y-2.5">
            {[80, 65, 75, 55, 70].map((w, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 flex-shrink-0" />
                <div className={`h-3 rounded bg-slate-200 dark:bg-slate-700`} style={{ width: `${w}%` }} />
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="h-3 w-20 rounded mb-4 bg-slate-200 dark:bg-slate-700" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 rounded bg-slate-200 dark:bg-slate-700 w-full" />
                  <div className="h-3 rounded bg-slate-200 dark:bg-slate-700 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
