import { MapPin, Flame, Dumbbell, Bookmark, BookmarkCheck } from 'lucide-react'

export default function FastFoodCard({ meal, onSave, saved }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-sm animate-slide-up">
      {/* Header band */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2 opacity-90">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">Fast Food Options</span>
            </div>
            <h2 className="text-2xl font-bold leading-tight">{meal.name}</h2>
            <p className="mt-1.5 text-sm opacity-85 leading-relaxed">{meal.description}</p>
          </div>
          {onSave && (
            <button
              onClick={onSave}
              disabled={saved}
              className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 disabled:opacity-60 transition flex items-center justify-center"
              title={saved ? 'Saved!' : 'Save options'}
            >
              {saved
                ? <BookmarkCheck className="w-5 h-5" />
                : <Bookmark className="w-5 h-5" />}
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 bg-white/20 rounded-lg px-3 py-1.5 text-sm font-semibold">
            <Dumbbell className="w-4 h-4" />
            {meal.protein} protein
          </div>
          <div className="flex items-center gap-1.5 bg-white/20 rounded-lg px-3 py-1.5 text-sm font-semibold">
            <Flame className="w-4 h-4" />
            {meal.calories} cal
          </div>
        </div>
      </div>

      {/* Restaurant options */}
      {meal.restaurants?.length > 0 && (
        <div className="p-6">
          <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
            Top Options Near You
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {meal.restaurants.map((r, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 dark:border-slate-700/50 p-4 hover:border-orange-300 dark:hover:border-orange-500/40 transition-colors"
              >
                {/* Rank + name */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600 dark:text-orange-400 font-bold text-xs">{i + 1}</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                    {r.name}
                  </span>
                </div>

                {/* Item */}
                <p className="text-slate-800 dark:text-slate-200 text-sm font-medium mb-2 leading-snug">
                  {r.item}
                </p>

                {/* Macros */}
                <div className="flex gap-3 mb-3">
                  <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Dumbbell className="w-3 h-3" /> {r.protein}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Flame className="w-3 h-3" /> {r.calories} cal
                  </span>
                </div>

                {/* Tip */}
                {r.modifications && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-2.5">
                    <p className="text-xs text-orange-700 dark:text-orange-300 leading-snug">
                      <span className="font-semibold">Order tip: </span>
                      {r.modifications}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
