import { MapPin, Flame, Dumbbell, Bookmark, BookmarkCheck, Wheat, Droplets, AlertTriangle, ExternalLink } from 'lucide-react'

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

function MiniMacro({ icon: Icon, value, label }) {
  if (!value) return null
  return (
    <span className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
      <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
      {value} <span className="text-slate-400 dark:text-slate-500">{label}</span>
    </span>
  )
}

// Protein efficiency as a percentage of calories from protein
function proteinPct(protein, calories) {
  const p = parseFloat(String(protein).replace(/[^0-9.]/g, ''))
  const c = parseFloat(String(calories).replace(/[^0-9.]/g, ''))
  if (!p || !c) return null
  return Math.round((p * 4 / c) * 100)
}

// Returns true if macros look physically impossible
function macrosAreSuspect(protein, calories) {
  const p = parseFloat(String(protein).replace(/[^0-9.]/g, ''))
  const c = parseFloat(String(calories).replace(/[^0-9.]/g, ''))
  if (!p || !c) return false
  return c < p * 4 * 0.8
}

export default function FastFoodCard({ meal, onSave, saved }) {
  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-700/50 overflow-hidden shadow-sm animate-slide-up">

      {/* Header band */}
      <div className="bg-gradient-to-br from-orange-500 via-orange-500 to-red-500 p-4 sm:p-6 text-white">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 opacity-90">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
              <span className="text-xs sm:text-sm font-semibold tracking-wide">Fast Food Options</span>
            </div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-extrabold leading-tight">{meal.name}</h2>
            <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm opacity-85 leading-relaxed">{meal.description}</p>
          </div>
          {onSave && (
            <button
              onClick={onSave}
              disabled={saved}
              className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 hover:bg-white/30 disabled:opacity-60 transition-colors flex items-center justify-center"
              title={saved ? 'Saved!' : 'Save options'}
            >
              {saved ? <BookmarkCheck className="w-4 h-4 sm:w-5 sm:h-5" /> : <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          )}
        </div>

        {/* Macro chips */}
        <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2">
          <MacroChip icon={Dumbbell} value={meal.protein}  label="protein" />
          <MacroChip icon={Flame}    value={meal.calories} label="cal" />
          <MacroChip icon={Wheat}    value={meal.carbs}    label="carbs" />
          <MacroChip icon={Droplets} value={meal.fat}      label="fat" />
        </div>
      </div>

      {/* Accuracy disclaimer */}
      <div className="mx-4 sm:mx-6 mt-4 flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-xl p-3">
        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Nutrition estimates only</p>
          <p className="text-[11px] text-amber-600 dark:text-amber-500 mt-0.5 leading-relaxed">
            AI-generated macros for fast food are approximate. Always verify on the restaurant's app or website before ordering.
          </p>
        </div>
      </div>

      {/* Restaurant options */}
      {meal.restaurants?.length > 0 && (
        <div className="p-4 sm:p-6">
          <h3 className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 sm:mb-4">
            Top Options
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {meal.restaurants.map((r, i) => {
              const pct     = proteinPct(r.protein, r.calories)
              const suspect = macrosAreSuspect(r.protein, r.calories)
              return (
                <div
                  key={i}
                  className="rounded-xl border border-slate-200 dark:border-slate-700/50 p-3 sm:p-4 hover:border-orange-300 dark:hover:border-orange-500/40 hover:shadow-md transition-all"
                >
                  {/* Rank + name + efficiency */}
                  <div className="flex items-center gap-2 sm:gap-2.5 mb-2 sm:mb-3">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-600 dark:text-orange-400 font-bold text-[10px] sm:text-xs">{i + 1}</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate flex-1">{r.name}</span>
                    {pct !== null && !suspect && (
                      <span className="text-[9px] sm:text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded-md px-1.5 py-0.5 flex-shrink-0">
                        {pct}% protein
                      </span>
                    )}
                  </div>

                  {/* Item */}
                  <p className="text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-medium mb-2 sm:mb-3 leading-snug">{r.item}</p>

                  {/* Macros */}
                  <div className="flex flex-wrap gap-x-2 sm:gap-x-3 gap-y-1 mb-2 sm:mb-3">
                    <MiniMacro icon={Dumbbell} value={r.protein}  label="protein" />
                    <MiniMacro icon={Flame}    value={r.calories} label="cal" />
                    <MiniMacro icon={Wheat}    value={r.carbs}    label="carbs" />
                    <MiniMacro icon={Droplets} value={r.fat}      label="fat" />
                  </div>

                  {/* Suspect macro warning */}
                  {suspect && (
                    <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 mb-2">
                      <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                      Macros look off — double-check before ordering
                    </div>
                  )}

                  {/* Order tip */}
                  {r.modifications && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-2 sm:p-2.5 border border-orange-100 dark:border-orange-800/30">
                      <p className="text-[10px] sm:text-xs text-orange-700 dark:text-orange-300 leading-snug">
                        <span className="font-semibold">Order tip: </span>
                        {r.modifications}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Verify link hint */}
          <p className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
            Tip: Search "[restaurant name] nutrition calculator" to get exact macros for your order.
          </p>
        </div>
      )}
    </div>
  )
}
