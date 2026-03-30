import { ChefHat, Flame, Dumbbell, Bookmark, BookmarkCheck } from 'lucide-react'

export default function HomeCookedCard({ meal, onSave, saved }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-sm animate-slide-up">
      {/* Header band */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2 opacity-90">
              <ChefHat className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">Home Cooked</span>
            </div>
            <h2 className="text-2xl font-bold leading-tight">{meal.name}</h2>
            <p className="mt-1.5 text-sm opacity-85 leading-relaxed">{meal.description}</p>
          </div>
          {onSave && (
            <button
              onClick={onSave}
              disabled={saved}
              className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 disabled:opacity-60 transition flex items-center justify-center"
              title={saved ? 'Saved!' : 'Save recipe'}
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

      {/* Body */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Ingredients */}
        {meal.ingredients?.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
              Ingredients
            </h3>
            <ul className="space-y-2.5">
              {meal.ingredients.map((ing, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  {ing}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Steps */}
        {meal.steps?.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
              Instructions
            </h3>
            <ol className="space-y-4">
              {meal.steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}
