import { useState, useRef } from 'react'
import {
  Trash2, ChefHat, MapPin, Dumbbell, Flame, Calendar,
  BookOpen, ChevronDown, ChevronUp, Wheat, Droplets,
  UtensilsCrossed, ArrowUpDown, Star, StickyNote, ShoppingCart, X,
} from 'lucide-react'
import HomeCookedCard from './HomeCookedCard'
import FastFoodCard from './FastFoodCard'
import ShoppingList from './ShoppingList'
import { getRecipes, removeRecipe, clearAllRecipes } from '../lib/recipes'
import { getAllRatings, setRating, getAllNotes, setNote } from '../lib/ratings'

const SORT_OPTIONS = [
  { value: 'newest',   label: 'Newest first' },
  { value: 'oldest',   label: 'Oldest first' },
  { value: 'protein',  label: 'Highest protein' },
  { value: 'calories', label: 'Highest calories' },
  { value: 'rating',   label: 'Top rated' },
]

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

// Star rating row
function StarRating({ id, rating, onRate }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onRate(id, star === rating ? 0 : star)}
          className="p-0.5 transition-transform hover:scale-110"
          title={`${star} star${star !== 1 ? 's' : ''}`}
        >
          <Star
            className={`w-3.5 h-3.5 transition-colors ${
              star <= (hover || rating)
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-300 dark:text-slate-600'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

// Swipeable row wrapper for mobile delete
function SwipeableRow({ onDelete, children }) {
  const startXRef = useRef(null)
  const [swiped, setSwiped] = useState(false)

  function onTouchStart(e) {
    startXRef.current = e.touches[0].clientX
  }

  function onTouchEnd(e) {
    if (startXRef.current === null) return
    const delta = startXRef.current - e.changedTouches[0].clientX
    if (delta > 80) setSwiped(true)
    else if (delta < -30) setSwiped(false)
    startXRef.current = null
  }

  return (
    <div className="relative overflow-hidden">
      {/* Delete reveal */}
      {swiped && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 z-10">
          <button
            onClick={e => { e.stopPropagation(); onDelete() }}
            className="bg-red-500 hover:bg-red-600 text-white rounded-xl px-4 py-2 text-xs font-bold transition-colors"
          >
            Delete
          </button>
        </div>
      )}
      <div
        className={`transition-transform duration-200 ${swiped ? '-translate-x-20' : 'translate-x-0'}`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {children}
      </div>
    </div>
  )
}

export default function SavedRecipes({ onDelete, onClearAll }) {
  const [recipes,       setRecipes]       = useState(() => getRecipes())
  const [expanded,      setExpanded]      = useState(null)
  const [sortBy,        setSortBy]        = useState('newest')
  const [sortOpen,      setSortOpen]      = useState(false)
  const [confirmClear,  setConfirmClear]  = useState(false)
  const [ratings,       setRatings]       = useState(() => getAllRatings())
  const [notes,         setNotes]         = useState(() => getAllNotes())
  const [editingNote,   setEditingNote]   = useState(null)
  const [noteText,      setNoteText]      = useState('')
  const [showShopping,  setShowShopping]  = useState(false)

  function deleteRecipe(id) {
    removeRecipe(id)
    setRecipes(prev => prev.filter(r => r.id !== id))
    if (expanded === id) setExpanded(null)
    onDelete?.()
  }

  function clearAll() {
    const count = recipes.length
    clearAllRecipes()
    setRecipes([])
    setExpanded(null)
    setConfirmClear(false)
    onClearAll?.(count)
  }

  function handleRate(id, stars) {
    setRating(id, stars)
    setRatings(prev => {
      const next = { ...prev }
      if (stars === 0) delete next[id]
      else next[id] = stars
      return next
    })
  }

  function openNote(id) {
    setNoteText(notes[id] || '')
    setEditingNote(id)
  }

  function saveNote(id) {
    setNote(id, noteText)
    setNotes(prev => {
      const next = { ...prev }
      const trimmed = noteText.trim()
      if (!trimmed) delete next[id]
      else next[id] = trimmed
      return next
    })
    setEditingNote(null)
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

  // Compute stats
  const proteins    = recipes.map(r => parseMacro(r.protein)).filter(Boolean)
  const cals        = recipes.map(r => parseMacro(r.calories)).filter(Boolean)
  const homeCount   = recipes.filter(r => r.type === 'home_cooked').length
  const avgProtein  = proteins.length ? Math.round(proteins.reduce((a, b) => a + b, 0) / proteins.length) : 0
  const avgCalories = cals.length     ? Math.round(cals.reduce((a, b) => a + b, 0) / cals.length) : 0

  // Sort
  const sorted = [...recipes].sort((a, b) => {
    if (sortBy === 'newest')   return new Date(b.savedAt) - new Date(a.savedAt)
    if (sortBy === 'oldest')   return new Date(a.savedAt) - new Date(b.savedAt)
    if (sortBy === 'protein')  return (parseMacro(b.protein)  || 0) - (parseMacro(a.protein)  || 0)
    if (sortBy === 'calories') return (parseMacro(b.calories) || 0) - (parseMacro(a.calories) || 0)
    if (sortBy === 'rating')   return (ratings[b.id] || 0) - (ratings[a.id] || 0)
    return 0
  })

  const currentSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'Sort'

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        <StatCard icon={UtensilsCrossed} label="Total Saved"  value={recipes.length}     accent="indigo"  />
        <StatCard icon={Dumbbell}        label="Avg Protein"  value={`${avgProtein}g`}   accent="violet"  />
        <StatCard icon={Flame}           label="Avg Calories" value={avgCalories || '—'} accent="orange"  />
        <StatCard icon={ChefHat}         label="Home Cooked"  value={homeCount}          accent="emerald" />
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
          Saved Recipes
          <span className="ml-2 text-sm font-normal text-slate-400 dark:text-slate-500">
            {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
          </span>
        </h2>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Shopping list */}
          <button
            onClick={() => setShowShopping(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Shopping List</span>
          </button>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortOpen(v => !v)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              {currentSortLabel}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-1.5 z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden min-w-[160px]">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setSortBy(opt.value); setSortOpen(false) }}
                    className={`w-full text-left px-3 py-2.5 text-xs font-medium transition-colors ${
                      sortBy === opt.value
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear all */}
          {!confirmClear ? (
            <button
              onClick={() => setConfirmClear(true)}
              className="text-xs font-semibold text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors px-2 py-2"
            >
              Clear all
            </button>
          ) : (
            <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 rounded-xl px-2.5 py-1.5">
              <span className="text-[11px] text-red-600 dark:text-red-400 font-medium">Sure?</span>
              <button onClick={clearAll} className="text-[11px] font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">Yes</button>
              <span className="text-red-300 dark:text-red-700">·</span>
              <button onClick={() => setConfirmClear(false)} className="text-[11px] font-medium text-slate-500 dark:text-slate-400">No</button>
            </div>
          )}
        </div>
      </div>

      {/* Recipe list */}
      {sorted.map(recipe => {
        const isExpanded = expanded === recipe.id
        const isHome     = recipe.type === 'home_cooked'
        const myRating   = ratings[recipe.id] || 0
        const myNote     = notes[recipe.id] || ''

        return (
          <SwipeableRow key={recipe.id} onDelete={() => deleteRecipe(recipe.id)}>
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-700/50 overflow-hidden shadow-sm">
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
                  {/* Note toggle */}
                  <button
                    onClick={e => { e.stopPropagation(); openNote(recipe.id) }}
                    className={`p-1.5 sm:p-2 rounded-lg transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center ${
                      myNote
                        ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                        : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                    }`}
                    title="Add note"
                  >
                    <StickyNote className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
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

              {/* Star rating + note preview bar */}
              <div
                className="flex items-center justify-between gap-2 px-3 sm:px-4 pb-2.5 -mt-1"
                onClick={e => e.stopPropagation()}
              >
                <StarRating id={recipe.id} rating={myRating} onRate={handleRate} />
                {myNote && (
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 italic truncate max-w-[200px]">
                    "{myNote}"
                  </p>
                )}
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
          </SwipeableRow>
        )
      })}

      {/* Note editor modal */}
      {editingNote && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm" onClick={() => setEditingNote(null)}>
          <div
            className="bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <p className="font-bold text-slate-900 dark:text-white text-sm">Recipe Note</p>
              <button onClick={() => setEditingNote(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Add your notes, tweaks, or tips for this recipe…"
                rows={4}
                autoFocus
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <div className="flex gap-2">
                <button onClick={() => saveNote(editingNote)} className="flex-1 py-2 rounded-xl bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-600 transition-colors">Save</button>
                <button onClick={() => setEditingNote(null)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shopping list modal */}
      {showShopping && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowShopping(false)}>
          <div
            className="bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden max-h-[85vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="overflow-y-auto p-4 sm:p-5">
              <ShoppingList recipes={recipes} onClose={() => setShowShopping(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
