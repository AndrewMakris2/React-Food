import { useState } from 'react'
import {
  Trash2, ChefHat, MapPin, Dumbbell, Flame, Calendar,
  BookOpen, ChevronDown, ChevronUp, Wheat, Droplets,
  UtensilsCrossed,
} from 'lucide-react'
import HomeCookedCard from './HomeCookedCard'
import FastFoodCard from './FastFoodCard'
import { getRecipes, removeRecipe } from '../lib/recipes'

function StatCard({ icon: Icon, label, value, accent }) {
  const styles = {
    violet:  'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-800/30',
    orange:  'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-800/30',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/30',
    indigo:  'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/30',
  }
  return (
    <div className={`rounded-xl sm:rounded-2xl border p-3 sm:p-4 flex items-center gap-3 sm:gap-4 ${styles[accent]}`}>
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/60 dark:bg-white/5 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xl sm:text-2xl font-extrabold leading-none">{value}</p>
        <p className="text-[10px] sm:text-xs font-medium mt-0.5 opacity-70 truncate">{label}</p>
      </div>
    </div>
  )
}

function parseMacro(val) {
  if (!val) return null
  const n = parseInt(String(val).replace(/[^0-9]/g, ''))
  return isNaN(n) ? null : n
}

export default function SavedRecipes({ onDelete }) {
  const [recipes,  setRecipes]  = useState(() => getRecipes())
  const [expanded, setExpanded] = useState(null)
  const [deleting, setDeleting] = useState(null)

  function deleteRecipe(id) {
    setDeleting(id)
    removeRecipe(id)
    setRecipes(prev => prev.filter(r => r.id !== id))
    if (expanded === id) setExpanded(null)
    onDelete?.()
    setDeleting(null)
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-16 sm:py-24">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-slate-400" />
        </div>
        <h3 className="text-slate-900 dark:text-white font-bold text-base sm:text-lg">No saved recipes yet</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs sm:text-sm">
          Generate a meal and hit the bookmark icon to save it here.
        </p>
      </div>
    )
  }

  const proteins  = recipes.map(r => parseMacro(r.protein)).filter(Boolean)
  const calories  = recipes.map(r => parseMacro(r.calories)).filter(Boolean)
  const homeCount = recipes.filter(r => r.type === 'home_cooked').length
  const avgProtein  = proteins.length ? Math.round(proteins.reduce((a, b) => a + b, 0) / proteins.length) : 0
  const avgCalories = calories.length ? Math.round(calories.reduce((a, b) => a + b, 0) / calories.length) : 0

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        <StatCard icon={UtensilsCrossed} label="Total Saved"   value={recipes.length}       accent="indigo"  />
        <StatCard icon={Dumbbell}        label="Avg Protein"   value={`${avgProtein}g`}     accent="violet"  />
        <StatCard icon={Flame}           label="Avg Calories"  value={avgCalories || '—'}   accent="orange"  />
        <StatCard icon={ChefHat}         label="Home Cooked"   value={homeCount}            accent="emerald" />
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">Saved Recipes</h2>
        <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
        </span>
      </div>

      {/* Recipe list */}
      {recipes.map(recipe => {
        const isExpanded = expanded === recipe.id
        const isDeleting = deleting === recipe.id
        const isHome     = recipe.type === 'home_cooked'

        return (
          <div
            key={recipe.id}
            className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-700/50 overflow-hidden shadow-sm"
          >
            {/* Summary row */}
            <div
              className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-3 sm:py-3.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors select-none"
              onClick={() => setExpanded(isExpanded ? null : recipe.id)}
            >
              {/* Type icon */}
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ${
                isHome
                  ? 'bg-emerald-100 dark:bg-emerald-900/30'
                  : 'bg-orange-100 dark:bg-orange-900/30'
              }`}>
                {isHome
                  ? <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
                  : <MapPin  className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 dark:text-orange-400" />
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">{recipe.name}</p>
                {/* Macros — hide carbs/fat on smallest screens */}
                <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-0.5 mt-0.5">
                  {recipe.protein && (
                    <span className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                      <Dumbbell className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {recipe.protein}
                    </span>
                  )}
                  {recipe.calories && (
                    <span className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                      <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {recipe.calories} cal
                    </span>
                  )}
                  {recipe.carbs && (
                    <span className="hidden sm:flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Wheat className="w-3 h-3" /> {recipe.carbs}
                    </span>
                  )}
                  {recipe.fat && (
                    <span className="hidden sm:flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Droplets className="w-3 h-3" /> {recipe.fat}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-400 dark:text-slate-500">
                    <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    {new Date(recipe.savedAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                <button
                  onClick={e => { e.stopPropagation(); deleteRecipe(recipe.id) }}
                  className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
                  title="Delete recipe"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                {isExpanded
                  ? <ChevronUp   className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                  : <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                }
              </div>
            </div>

            {/* Expanded detail */}
            {isExpanded && (
              <div className="border-t border-slate-200 dark:border-slate-700/50">
                {isHome
                  ? <HomeCookedCard meal={recipe} />
                  : <FastFoodCard   meal={recipe} />
                }
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
