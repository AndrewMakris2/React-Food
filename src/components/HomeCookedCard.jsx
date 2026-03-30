import { ChefHat, Flame, Dumbbell, Bookmark, BookmarkCheck, Wheat, Droplets } from 'lucide-react'

function MacroChip({ icon: Icon, value, label }) {
  if (!value) return null
  return (
    <div className="flex items-center gap-1 sm:gap-1.5 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold bg-white/20">
      <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
      <span>{value}</span>
      {label && <span className="opacity-75 text-[10px] sm:text-xs font-normal">{label}</span>}
    </div>
  )
}

export default function HomeCookedCard({ meal, onSave, saved }) {
  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-700/50 overflow-hidden shadow-sm animate-slide-up">

      {/* Header band */}
      <div className="bg-gradient-to-br from-emerald-500 via-emerald-500 to-teal-500 p-4 sm:p-6 text-white">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 opacity-90">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <ChefHat className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
              <span className="text-xs sm:text-sm font-semibold tracking-wide">Home Cooked</span>
            </div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-extrabold leading-tight">{meal.name}</h2>
            <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm opacity-85 leading-relaxed">{meal.description}</p>
          </div>
          {onSave && (
            <button
              onClick={onSave}
              disabled={saved}
              className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 hover:bg-white/30 disabled:opacity-60 transition-colors flex items-center justify-center"
              title={saved ? 'Saved!' : 'Save recipe'}
            >
              {saved ? <BookmarkCheck className="w-4 h-4 sm:w-5 sm:h-5" /> : <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          )}
        </div>

        {/* Macro chips */}
        <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2">
          <MacroChip icon={Dumbbell} value={meal.protein} label="protein" />
          <MacroChip icon={Flame}    value={meal.calories} label="cal" />
          <MacroChip icon={Wheat}    value={meal.carbs}    label="carbs" />
          <MacroChip icon={Droplets} value={meal.fat}      label="fat" />
        </div>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">

        {/* Ingredients */}
        {meal.ingredients?.length > 0 && (
          <div>
            <h3 className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 sm:mb-4">
              Ingredients
            </h3>
            <ul className="space-y-2 sm:space-y-2.5">
              {meal.ingredients.map((ing, i) => (
                <li key={i} className="flex items-start gap-2 sm:gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
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
            <h3 className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 sm:mb-4">
              Instructions
            </h3>
            <ol className="space-y-3 sm:space-y-4">
              {meal.steps.map((step, i) => (
                <li key={i} className="flex gap-2.5 sm:gap-3">
                  <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[10px] sm:text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}
