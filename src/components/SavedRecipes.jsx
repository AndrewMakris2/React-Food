import { useState, useEffect } from 'react'
import { Trash2, ChefHat, MapPin, Dumbbell, Flame, Calendar, BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import HomeCookedCard from './HomeCookedCard'
import FastFoodCard from './FastFoodCard'

export default function SavedRecipes({ onDelete }) {
  const [recipes, setRecipes]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    fetch('/api/recipes')
      .then(r => r.json())
      .then(data => setRecipes(Array.isArray(data) ? data : []))
      .catch(() => setRecipes([]))
      .finally(() => setLoading(false))
  }, [])

  async function deleteRecipe(id) {
    setDeleting(id)
    try {
      await fetch(`/api/recipes/${id}`, { method: 'DELETE' })
      setRecipes(prev => prev.filter(r => r.id !== id))
      if (expanded === id) setExpanded(null)
      onDelete?.()
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-slate-900 dark:text-white font-semibold text-lg">No saved recipes yet</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Generate a meal and hit the bookmark icon to save it here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Saved Recipes</h2>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
        </span>
      </div>

      {recipes.map(recipe => {
        const isExpanded = expanded === recipe.id
        const isDeleting = deleting === recipe.id

        return (
          <div
            key={recipe.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-sm"
          >
            {/* Summary row */}
            <div
              className="flex items-center gap-4 px-4 py-3.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition select-none"
              onClick={() => setExpanded(isExpanded ? null : recipe.id)}
            >
              {/* Type icon */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                recipe.type === 'home_cooked'
                  ? 'bg-emerald-100 dark:bg-emerald-900/30'
                  : 'bg-orange-100 dark:bg-orange-900/30'
              }`}>
                {recipe.type === 'home_cooked'
                  ? <ChefHat className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  : <MapPin className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                  {recipe.name}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                  <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Dumbbell className="w-3 h-3" /> {recipe.protein}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Flame className="w-3 h-3" /> {recipe.calories} cal
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Calendar className="w-3 h-3" />
                    {new Date(recipe.savedAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={e => { e.stopPropagation(); deleteRecipe(recipe.id) }}
                  disabled={isDeleting}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-40 transition"
                  title="Delete recipe"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {isExpanded
                  ? <ChevronUp className="w-4 h-4 text-slate-400" />
                  : <ChevronDown className="w-4 h-4 text-slate-400" />
                }
              </div>
            </div>

            {/* Expanded detail */}
            {isExpanded && (
              <div className="border-t border-slate-200 dark:border-slate-700/50">
                {recipe.type === 'home_cooked'
                  ? <HomeCookedCard meal={recipe} />
                  : <FastFoodCard meal={recipe} />
                }
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
