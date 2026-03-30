import { useState } from 'react'
import { Zap, ChefHat, MapPin, Loader2, Shuffle, Dumbbell, Flame, Wheat, Droplets } from 'lucide-react'
import HomeCookedCard from './HomeCookedCard'
import FastFoodCard from './FastFoodCard'
import { addRecipe } from '../lib/recipes'

const MEAL_TYPES = [
  { value: 'any',         label: 'Surprise Me', Icon: Shuffle  },
  { value: 'home_cooked', label: 'Home Cooked',  Icon: ChefHat },
  { value: 'fast_food',   label: 'Fast Food',    Icon: MapPin  },
]

const CUISINES = [
  'Any', 'American', 'Mexican', 'Italian', 'Asian', 'Japanese',
  'Mediterranean', 'Indian', 'Greek', 'Middle Eastern', 'Korean', 'Thai',
]

const PROTEIN_SOURCES = [
  'Any', 'Chicken', 'Beef', 'Fish', 'Shrimp', 'Pork',
  'Turkey', 'Eggs', 'Tofu', 'Plant-based',
]

const MEAL_TIMES = [
  'Any', 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Pre-Workout', 'Post-Workout',
]

const COOK_TIMES = [
  'Any', 'Under 15 min', '15–30 min', '30–60 min', '1+ hour',
]

const SPICE_LEVELS = [
  'Any', 'No Spice', 'Mild', 'Medium', 'Spicy', 'Extra Hot',
]

const SERVINGS = ['1', '2', '3', '4', '5', '6']

function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-2 mb-3 sm:mb-4">
      <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700/50" />
    </div>
  )
}

function ChipGroup({ label, options, value, onChange }) {
  return (
    <div>
      <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {options.map(opt => {
          const active = value === opt
          return (
            <button
              key={opt}
              onClick={() => onChange(active ? 'Any' : opt)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all min-h-[32px] ${
                active
                  ? 'bg-indigo-500 border-indigo-500 text-white shadow-sm shadow-indigo-500/25'
                  : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Static color classes to avoid Tailwind purge issues
const MACRO_STYLES = {
  protein:  {
    border: 'border-violet-200 dark:border-violet-700/40',
    bg:     'bg-violet-50 dark:bg-violet-900/10',
    label:  'text-violet-700 dark:text-violet-400',
    toggle: 'bg-violet-500',
    preset: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
    presetActive: 'bg-violet-500 text-white',
  },
  calories: {
    border: 'border-orange-200 dark:border-orange-700/40',
    bg:     'bg-orange-50 dark:bg-orange-900/10',
    label:  'text-orange-700 dark:text-orange-400',
    toggle: 'bg-orange-500',
    preset: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    presetActive: 'bg-orange-500 text-white',
  },
  carbs:    {
    border: 'border-amber-200 dark:border-amber-700/40',
    bg:     'bg-amber-50 dark:bg-amber-900/10',
    label:  'text-amber-700 dark:text-amber-400',
    toggle: 'bg-amber-500',
    preset: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    presetActive: 'bg-amber-500 text-white',
  },
  fat:      {
    border: 'border-rose-200 dark:border-rose-700/40',
    bg:     'bg-rose-50 dark:bg-rose-900/10',
    label:  'text-rose-700 dark:text-rose-400',
    toggle: 'bg-rose-500',
    preset: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
    presetActive: 'bg-rose-500 text-white',
  },
}

function MacroInput({ id, icon: Icon, label, unit, hint, value, onChange, required, enabled, onToggle, presets }) {
  const s = MACRO_STYLES[id]
  const active = required || enabled

  return (
    <div className={`rounded-xl sm:rounded-2xl border p-3 sm:p-4 transition-all duration-200 ${
      active ? `${s.border} ${s.bg}` : 'border-slate-200 dark:border-slate-700/40 bg-white/50 dark:bg-slate-800/30'
    }`}>
      {/* Top row */}
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className={`flex items-center gap-1 sm:gap-1.5 font-semibold text-[10px] sm:text-xs uppercase tracking-widest ${
          active ? s.label : 'text-slate-400 dark:text-slate-500'
        }`}>
          <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
          <span>{label}</span>
        </div>
        {!required && (
          <button
            onClick={onToggle}
            className={`relative w-8 h-4 sm:w-9 sm:h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${
              enabled ? s.toggle : 'bg-slate-300 dark:bg-slate-600'
            }`}
            aria-label={`Toggle ${label}`}
          >
            <span className={`absolute top-0.5 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white shadow transition-transform duration-200 ${
              enabled ? 'translate-x-4' : 'translate-x-0.5'
            }`} />
          </button>
        )}
      </div>

      {active ? (
        <>
          <div className="flex items-baseline gap-1">
            <input
              type="number"
              inputMode="numeric"
              value={value}
              onChange={e => onChange(e.target.value)}
              min="0"
              className="w-full bg-transparent text-xl sm:text-2xl font-bold text-slate-900 dark:text-white focus:outline-none placeholder-slate-300 dark:placeholder-slate-600"
              placeholder="—"
            />
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium flex-shrink-0">{unit}</span>
          </div>
          <p className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wider">{hint}</p>
          {presets && (
            <div className="flex gap-1 mt-2 sm:mt-3">
              {presets.map(p => (
                <button
                  key={p}
                  onClick={() => onChange(String(p))}
                  className={`flex-1 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-semibold transition-colors min-h-[24px] ${
                    value === String(p) ? s.presetActive : s.preset
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="mt-1">
          <p className="text-slate-400 dark:text-slate-500 text-xs sm:text-sm font-medium">No limit</p>
          <p className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wider">{hint}</p>
        </div>
      )}
    </div>
  )
}

export default function MealGenerator({ generatedMeal, setGeneratedMeal, onSaved }) {
  const [proteinGoal,   setProteinGoal]   = useState('50')
  const [maxCalories,   setMaxCalories]   = useState('')
  const [maxCarbs,      setMaxCarbs]      = useState('')
  const [maxFat,        setMaxFat]        = useState('')
  const [caloriesOn,    setCaloriesOn]    = useState(false)
  const [carbsOn,       setCarbsOn]       = useState(false)
  const [fatOn,         setFatOn]         = useState(false)
  const [mealType,      setMealType]      = useState('any')
  const [cuisine,       setCuisine]       = useState('Any')
  const [proteinSource, setProteinSource] = useState('Any')
  const [mealTime,      setMealTime]      = useState('Any')
  const [cookTime,      setCookTime]      = useState('Any')
  const [spiceLevel,    setSpiceLevel]    = useState('Any')
  const [servings,      setServings]      = useState('2')
  const [resultCount,   setResultCount]   = useState(5)
  const [restrictions,  setRestrictions]  = useState('')
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState(null)
  const [saved,         setSaved]         = useState(false)
  const [savedSet,      setSavedSet]      = useState(new Set())

  async function generate() {
    setLoading(true)
    setError(null)
    setSaved(false)
    setSavedSet(new Set())
    setGeneratedMeal(null)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proteinGoal,
          maxCalories:  caloriesOn && maxCalories ? maxCalories : null,
          maxCarbs:     carbsOn    && maxCarbs    ? maxCarbs    : null,
          maxFat:       fatOn      && maxFat      ? maxFat      : null,
          mealType,
          cuisine:       cuisine !== 'Any'       ? cuisine       : null,
          proteinSource: proteinSource !== 'Any' ? proteinSource : null,
          mealTime:      mealTime !== 'Any'      ? mealTime      : null,
          cookTime:      cookTime !== 'Any'      ? cookTime      : null,
          spiceLevel:    spiceLevel !== 'Any'    ? spiceLevel    : null,
          servings,
          resultCount,
          restrictions,
        }),
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

  function saveRecipe() {
    if (!generatedMeal || saved) return
    addRecipe(generatedMeal)
    setSaved(true)
    onSaved?.()
  }

  function saveIndividualMeal(meal, index) {
    if (savedSet.has(index)) return
    addRecipe({ ...meal, type: 'home_cooked' })
    setSavedSet(prev => new Set([...prev, index]))
    onSaved?.()
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Hero */}
      <div className="text-center pt-1 sm:pt-2 pb-2 sm:pb-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight">
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Protein-Packed
          </span>{' '}
          <span className="text-slate-900 dark:text-white">Meal Generator</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1.5 sm:mt-2 text-xs sm:text-sm">
          Set your macro targets — Groq AI builds the perfect meal.
        </p>
      </div>

      {/* Form card */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-700/50 p-4 sm:p-6 shadow-sm">

        {/* ── Macro Targets ─────────────────── */}
        <div className="mb-5 sm:mb-6">
          <SectionDivider label="Macro Targets" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            <MacroInput
              id="protein"
              icon={Dumbbell}
              label="Protein"
              unit="g"
              hint="Min target"
              value={proteinGoal}
              onChange={setProteinGoal}
              required
              enabled
              presets={[30, 50, 75, 100]}
            />
            <MacroInput
              id="calories"
              icon={Flame}
              label="Calories"
              unit="kcal"
              hint="Max limit"
              value={maxCalories}
              onChange={setMaxCalories}
              required={false}
              enabled={caloriesOn}
              onToggle={() => setCaloriesOn(v => !v)}
              presets={[400, 600, 800]}
            />
            <MacroInput
              id="carbs"
              icon={Wheat}
              label="Carbs"
              unit="g"
              hint="Max limit"
              value={maxCarbs}
              onChange={setMaxCarbs}
              required={false}
              enabled={carbsOn}
              onToggle={() => setCarbsOn(v => !v)}
              presets={[30, 50, 80]}
            />
            <MacroInput
              id="fat"
              icon={Droplets}
              label="Fat"
              unit="g"
              hint="Max limit"
              value={maxFat}
              onChange={setMaxFat}
              required={false}
              enabled={fatOn}
              onToggle={() => setFatOn(v => !v)}
              presets={[20, 35, 50]}
            />
          </div>
        </div>

        {/* ── Food Preferences ──────────────── */}
        <div className="mb-5 sm:mb-6">
          <SectionDivider label="Food Preferences" />
          <div className="space-y-3 sm:space-y-4">
            <ChipGroup
              label="Cuisine Style"
              options={CUISINES}
              value={cuisine}
              onChange={setCuisine}
            />
            <ChipGroup
              label="Protein Source"
              options={PROTEIN_SOURCES}
              value={proteinSource}
              onChange={setProteinSource}
            />
            <ChipGroup
              label="Meal Time"
              options={MEAL_TIMES}
              value={mealTime}
              onChange={setMealTime}
            />
            <ChipGroup
              label="Spice Level"
              options={SPICE_LEVELS}
              value={spiceLevel}
              onChange={setSpiceLevel}
            />
            {mealType !== 'fast_food' && (
              <ChipGroup
                label="Cook Time"
                options={COOK_TIMES}
                value={cookTime}
                onChange={setCookTime}
              />
            )}
            {/* Servings — number row */}
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Servings</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {SERVINGS.map(s => (
                  <button
                    key={s}
                    onClick={() => setServings(s)}
                    className={`w-10 h-8 rounded-lg text-xs font-semibold border transition-all min-h-[32px] ${
                      servings === s
                        ? 'bg-indigo-500 border-indigo-500 text-white shadow-sm shadow-indigo-500/25'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Meal Options ──────────────────── */}
        <div>
          <SectionDivider label="Meal Options" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

            {/* Meal type */}
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Meal Type</p>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {MEAL_TYPES.map(({ value, label, Icon }) => (
                  <button
                    key={value}
                    onClick={() => setMealType(value)}
                    className={`flex flex-col items-center gap-1 sm:gap-1.5 py-2.5 sm:py-3 px-1 rounded-xl border text-[10px] sm:text-xs font-semibold transition-all min-h-[60px] sm:min-h-[72px] ${
                      mealType === value
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="leading-tight text-center">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: restrictions + count slider */}
            <div className="space-y-3 sm:space-y-4">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Dietary Restrictions{' '}
                  <span className="text-slate-400 font-normal">(optional)</span>
                </p>
                <textarea
                  value={restrictions}
                  onChange={e => setRestrictions(e.target.value)}
                  rows={2}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none text-xs sm:text-sm"
                  placeholder="e.g. no dairy, gluten-free, halal..."
                />
              </div>

              {/* Results slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                    {mealType === 'fast_food'
                      ? 'Fast Food Options'
                      : mealType === 'home_cooked'
                      ? 'Meal Variations'
                      : 'Results to Generate'}
                  </p>
                  <span className="text-base sm:text-lg font-extrabold text-indigo-500 tabular-nums w-6 text-right">
                    {resultCount}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={resultCount}
                  onChange={e => setResultCount(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer
                    bg-slate-200 dark:bg-slate-700
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-indigo-500
                    [&::-webkit-slider-thumb]:shadow-md
                    [&::-webkit-slider-thumb]:cursor-pointer
                    accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
                  <span>1</span><span>5</span><span>10</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={generate}
          disabled={loading}
          className="mt-5 sm:mt-6 w-full py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-[0.99]"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
              Generating with Groq AI…
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 flex-shrink-0" />
              Generate Meal
            </>
          )}
        </button>

        {error && (
          <div className="mt-3 p-3 sm:p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 flex items-start gap-2">
            <span className="text-red-500 flex-shrink-0 mt-0.5 text-sm">&#9888;</span>
            <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>

      {/* Results */}
      {generatedMeal && generatedMeal.type === 'home_cooked' && generatedMeal.meals?.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          {generatedMeal.meals.length > 1 && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{generatedMeal.meals.length}</span> meal variations generated — save the ones you like
            </p>
          )}
          {generatedMeal.meals.map((meal, i) => (
            <HomeCookedCard
              key={i}
              meal={meal}
              onSave={() => saveIndividualMeal(meal, i)}
              saved={savedSet.has(i)}
            />
          ))}
        </div>
      )}
      {generatedMeal && generatedMeal.type === 'fast_food' && (
        <FastFoodCard meal={generatedMeal} onSave={saveRecipe} saved={saved} />
      )}
    </div>
  )
}
