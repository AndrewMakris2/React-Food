import { useState } from 'react'
import { Zap, ChefHat, MapPin, Loader2, Shuffle } from 'lucide-react'
import HomeCookedCard from './HomeCookedCard'
import FastFoodCard from './FastFoodCard'

const MEAL_TYPES = [
  { value: 'any',         label: 'Surprise Me',  Icon: Shuffle   },
  { value: 'home_cooked', label: 'Home Cooked',   Icon: ChefHat  },
  { value: 'fast_food',   label: 'Fast Food',     Icon: MapPin   },
]

const PROTEIN_PRESETS = [30, 50, 75, 100]

export default function MealGenerator({ generatedMeal, setGeneratedMeal, onSaved }) {
  const [proteinGoal, setProteinGoal]   = useState('50')
  const [mealType, setMealType]         = useState('any')
  const [restrictions, setRestrictions] = useState('')
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState(null)
  const [saved, setSaved]               = useState(false)

  async function generate() {
    setLoading(true)
    setError(null)
    setSaved(false)
    setGeneratedMeal(null)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proteinGoal, mealType, restrictions }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setGeneratedMeal(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function saveRecipe() {
    if (!generatedMeal || saved) return
    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generatedMeal),
      })
      if (!res.ok) throw new Error('Save failed')
      setSaved(true)
      onSaved?.()
    } catch (e) {
      console.error('[save error]', e)
    }
  }

  return (
    <div className="space-y-6">
      {/* Form card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Generate Protein-Packed Meals
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Powered by Groq AI — set your target and let it build your meal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Protein goal */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Protein Goal (g)
            </label>
            <input
              type="number"
              value={proteinGoal}
              onChange={e => setProteinGoal(e.target.value)}
              min="10"
              max="300"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="e.g. 50"
            />
            {/* Quick presets */}
            <div className="flex gap-1.5 mt-2">
              {PROTEIN_PRESETS.map(g => (
                <button
                  key={g}
                  onClick={() => setProteinGoal(String(g))}
                  className={`flex-1 py-1 rounded-lg text-xs font-medium transition-colors ${
                    proteinGoal === String(g)
                      ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  {g}g
                </button>
              ))}
            </div>
          </div>

          {/* Meal type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Meal Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {MEAL_TYPES.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  onClick={() => setMealType(value)}
                  className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                    mealType === value
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary restrictions */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Restrictions{' '}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={restrictions}
              onChange={e => setRestrictions(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="e.g. no dairy, gluten-free"
            />
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={generate}
          disabled={loading}
          className="mt-6 w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating with AI…
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Generate Meal
            </>
          )}
        </button>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30">
            <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
          </div>
        )}
      </div>

      {/* Result */}
      {generatedMeal && (
        generatedMeal.type === 'home_cooked' ? (
          <HomeCookedCard meal={generatedMeal} onSave={saveRecipe} saved={saved} />
        ) : (
          <FastFoodCard meal={generatedMeal} onSave={saveRecipe} saved={saved} />
        )
      )}
    </div>
  )
}
