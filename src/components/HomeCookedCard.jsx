import { useState } from 'react'
import { ChefHat, Flame, Dumbbell, Bookmark, BookmarkCheck, Wheat, Droplets, AlertTriangle, CheckSquare, Square } from 'lucide-react'

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

// Returns true if macros look physically impossible
function macrosAreSuspect(meal) {
  const p = parseFloat(String(meal.protein).replace(/[^0-9.]/g, ''))
  const c = parseFloat(String(meal.calories).replace(/[^0-9.]/g, ''))
  if (!p || !c) return false
  return c < p * 4 * 0.8   // 20% tolerance for rounding
}

export default function HomeCookedCard({ meal, onSave, saved }) {
  const [checkedIngredients, setCheckedIngredients] = useState(new Set())
  const [checkedSteps,       setCheckedSteps]       = useState(new Set())
  const suspect = macrosAreSuspect(meal)

  function toggleIngredient(i) {
    setCheckedIngredients(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  function toggleStep(i) {
    setCheckedSteps(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const allIngredientsDone = meal.ingredients?.length > 0 && checkedIngredients.size === meal.ingredients.length
  const allStepsDone       = meal.steps?.length > 0        && checkedSteps.size       === meal.steps.length

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
          <MacroChip icon={Dumbbell} value={meal.protein}  label="protein" />
          <MacroChip icon={Flame}    value={meal.calories} label="cal" />
          <MacroChip icon={Wheat}    value={meal.carbs}    label="carbs" />
          <MacroChip icon={Droplets} value={meal.fat}      label="fat" />
        </div>

        {/* Macro sanity warning */}
        {suspect && (
          <div className="mt-3 flex items-center gap-1.5 bg-amber-500/20 rounded-lg px-3 py-1.5 text-xs font-medium text-amber-100">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            Macros may be inaccurate — try regenerating this meal
          </div>
        )}

        {/* Completion indicator */}
        {allStepsDone && (
          <div className="mt-3 flex items-center gap-1.5 bg-white/20 rounded-lg px-3 py-1.5 text-xs font-semibold">
            ✅ All steps complete — enjoy your meal!
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">

        {/* Ingredients */}
        {meal.ingredients?.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Ingredients
              </h3>
              {allIngredientsDone && (
                <span className="text-[10px] text-emerald-500 font-semibold">All gathered!</span>
              )}
            </div>
            <ul className="space-y-2 sm:space-y-2.5">
              {meal.ingredients.map((ing, i) => {
                const done = checkedIngredients.has(i)
                return (
                  <li
                    key={i}
                    onClick={() => toggleIngredient(i)}
                    className={`flex items-start gap-2 sm:gap-2.5 text-xs sm:text-sm cursor-pointer select-none transition-colors ${
                      done ? 'text-slate-400 dark:text-slate-600 line-through' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {done
                      ? <CheckSquare className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      : <Square      className="w-4 h-4 text-slate-300 dark:text-slate-600 flex-shrink-0 mt-0.5" />
                    }
                    {ing}
                  </li>
                )
              })}
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
              {meal.steps.map((step, i) => {
                const done = checkedSteps.has(i)
                return (
                  <li
                    key={i}
                    onClick={() => toggleStep(i)}
                    className="flex gap-2.5 sm:gap-3 cursor-pointer select-none group"
                  >
                    <span className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[10px] sm:text-xs font-bold flex items-center justify-center mt-0.5 transition-colors ${
                      done
                        ? 'bg-emerald-500 text-white'
                        : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/60'
                    }`}>
                      {done ? '✓' : i + 1}
                    </span>
                    <p className={`text-xs sm:text-sm leading-relaxed transition-colors mt-0.5 ${
                      done ? 'text-slate-400 dark:text-slate-600 line-through' : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {step}
                    </p>
                  </li>
                )
              })}
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}
