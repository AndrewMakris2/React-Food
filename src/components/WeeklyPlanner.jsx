import { useState } from 'react'
import { Plus, X, Calendar, Trash2, ChevronLeft, ChevronRight, Dumbbell } from 'lucide-react'
import { getPlan, setSlot, clearSlot, clearPlan, DAYS, SLOTS, getDayTotals } from '../lib/planner'
import { getRecipes } from '../lib/recipes'

function parseMacro(v) {
  return parseInt(String(v || '0').replace(/[^0-9]/g, '')) || 0
}

const SLOT_COLORS = {
  Breakfast: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/40 text-amber-700 dark:text-amber-400',
  Lunch:     'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700/40 text-emerald-700 dark:text-emerald-400',
  Dinner:    'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700/40 text-indigo-700 dark:text-indigo-400',
  Snack:     'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-700/40 text-violet-700 dark:text-violet-400',
}

const SLOT_DOTS = {
  Breakfast: 'bg-amber-400',
  Lunch:     'bg-emerald-400',
  Dinner:    'bg-indigo-400',
  Snack:     'bg-violet-400',
}

// Modal to pick a meal for a slot
function MealPicker({ day, slot, recipes, onPick, onClose }) {
  const [search, setSearch] = useState('')
  const filtered = recipes.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-sm">Add to {day} — {slot}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Pick from your saved meals</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search meals…"
            autoFocus
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          {filtered.length === 0 ? (
            <p className="text-center text-slate-400 dark:text-slate-500 text-sm py-6">
              {recipes.length === 0 ? 'No saved recipes yet. Generate and save some meals first!' : 'No matches found.'}
            </p>
          ) : (
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {filtered.map(r => (
                <button
                  key={r.id}
                  onClick={() => { onPick(r); onClose() }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-left"
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${r.type === 'home_cooked' ? 'bg-emerald-400' : 'bg-orange-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{r.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{r.protein} protein · {r.calories} cal</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function WeeklyPlanner() {
  const [plan,          setPlan]          = useState(() => getPlan())
  const [picker,        setPicker]        = useState(null)   // { day, slot }
  const [confirmClear,  setConfirmClear]  = useState(false)
  const [mobileDay,     setMobileDay]     = useState(0)      // index into DAYS for mobile

  const recipes = getRecipes()

  function handlePick(meal) {
    const { day, slot } = picker
    const updated = setSlot(day, slot, meal)
    setPlan({ ...updated })
  }

  function handleClear(day, slot) {
    const updated = clearSlot(day, slot)
    setPlan({ ...updated })
  }

  function handleClearAll() {
    clearPlan()
    setPlan(getPlan())
    setConfirmClear(false)
  }

  // Weekly totals
  const weeklyTotals = DAYS.reduce((acc, d) => {
    const t = getDayTotals(plan[d])
    acc.protein  += t.protein
    acc.calories += t.calories
    acc.carbs    += t.carbs
    acc.fat      += t.fat
    return acc
  }, { protein: 0, calories: 0, carbs: 0, fat: 0 })

  const totalMeals = DAYS.reduce((acc, d) =>
    acc + SLOTS.filter(s => plan[d]?.[s]).length, 0
  )

  return (
    <div className="space-y-4 sm:space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            Weekly Meal Plan
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {totalMeals} of {DAYS.length * SLOTS.length} slots filled
          </p>
        </div>
        {!confirmClear ? (
          <button
            onClick={() => setConfirmClear(true)}
            className="text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors px-2 py-1.5"
          >
            Clear all
          </button>
        ) : (
          <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 rounded-xl px-2.5 py-1.5">
            <span className="text-[11px] text-red-600 dark:text-red-400 font-medium">Clear plan?</span>
            <button onClick={handleClearAll} className="text-[11px] font-bold text-red-600 dark:text-red-400">Yes</button>
            <span className="text-red-300">·</span>
            <button onClick={() => setConfirmClear(false)} className="text-[11px] text-slate-500">No</button>
          </div>
        )}
      </div>

      {/* Weekly totals bar */}
      <div className="bg-gradient-to-r from-indigo-500 to-violet-600 rounded-xl sm:rounded-2xl p-4 text-white shadow-lg shadow-indigo-500/20">
        <p className="text-xs font-semibold opacity-80 mb-2">Weekly Totals</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Protein',  value: weeklyTotals.protein,  unit: 'g'    },
            { label: 'Calories', value: weeklyTotals.calories, unit: 'kcal' },
            { label: 'Carbs',    value: weeklyTotals.carbs,    unit: 'g'    },
            { label: 'Fat',      value: weeklyTotals.fat,      unit: 'g'    },
          ].map(m => (
            <div key={m.label} className="text-center">
              <p className="text-lg sm:text-xl font-extrabold">{m.value.toLocaleString()}</p>
              <p className="text-[10px] opacity-70">{m.unit}</p>
              <p className="text-[10px] opacity-80 font-medium">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile day nav */}
      <div className="sm:hidden flex items-center justify-between bg-white/80 dark:bg-slate-900/80 rounded-xl border border-slate-200/80 dark:border-slate-700/50 p-3">
        <button
          onClick={() => setMobileDay(d => Math.max(0, d - 1))}
          disabled={mobileDay === 0}
          className="p-2 rounded-lg disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        </button>
        <span className="font-bold text-slate-900 dark:text-white text-sm">{DAYS[mobileDay]}</span>
        <button
          onClick={() => setMobileDay(d => Math.min(DAYS.length - 1, d + 1))}
          disabled={mobileDay === DAYS.length - 1}
          className="p-2 rounded-lg disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        </button>
      </div>

      {/* Desktop: full grid | Mobile: single day view */}
      <>
        {/* Mobile single-day */}
        <div className="sm:hidden space-y-2">
          <DayColumn
            day={DAYS[mobileDay]}
            dayPlan={plan[DAYS[mobileDay]]}
            onAdd={(day, slot) => setPicker({ day, slot })}
            onClear={handleClear}
          />
        </div>

        {/* Desktop full week */}
        <div className="hidden sm:grid grid-cols-7 gap-2">
          {DAYS.map(day => (
            <DayColumn
              key={day}
              day={day}
              dayPlan={plan[day]}
              onAdd={(d, s) => setPicker({ day: d, slot: s })}
              onClear={handleClear}
            />
          ))}
        </div>
      </>

      {/* Meal picker modal */}
      {picker && (
        <MealPicker
          day={picker.day}
          slot={picker.slot}
          recipes={recipes}
          onPick={handlePick}
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  )
}

function DayColumn({ day, dayPlan, onAdd, onClear }) {
  const totals = getDayTotals(dayPlan)
  const filled = SLOTS.filter(s => dayPlan?.[s]).length

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/80 dark:border-slate-700/50 overflow-hidden shadow-sm">
      {/* Day header */}
      <div className="px-2 py-2 border-b border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50">
        <p className="font-bold text-slate-900 dark:text-white text-xs text-center">{day}</p>
        {filled > 0 && (
          <p className="text-[10px] text-indigo-500 text-center font-semibold">
            {totals.protein}g protein
          </p>
        )}
      </div>

      {/* Slots */}
      <div className="p-1.5 space-y-1.5">
        {SLOTS.map(slot => {
          const meal = dayPlan?.[slot]
          return (
            <div key={slot} className="relative group">
              {meal ? (
                <div className={`rounded-lg border p-1.5 ${SLOT_COLORS[slot]}`}>
                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-wider opacity-60">{slot}</p>
                      <p className="text-[10px] sm:text-[11px] font-semibold leading-tight truncate">{meal.name}</p>
                      <p className="text-[9px] opacity-70 font-medium">{meal.protein} · {meal.calories} cal</p>
                    </div>
                    <button
                      onClick={() => onClear(day, slot)}
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-black/10 transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => onAdd(day, slot)}
                  className="w-full rounded-lg border border-dashed border-slate-200 dark:border-slate-700 p-1.5 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all group/btn"
                >
                  <div className="flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${SLOT_DOTS[slot]} opacity-50`} />
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">{slot}</p>
                  </div>
                  <Plus className="w-3 h-3 text-slate-300 dark:text-slate-600 mx-auto mt-0.5 group-hover/btn:text-indigo-400 transition-colors" />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Day totals */}
      {filled > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-700/50 px-2 py-1.5 bg-slate-50 dark:bg-slate-800/30">
          <div className="grid grid-cols-2 gap-0.5">
            <p className="text-[9px] text-slate-500 font-medium">{totals.calories} cal</p>
            <p className="text-[9px] text-slate-500 font-medium text-right">{totals.carbs}g carbs</p>
            <p className="text-[9px] text-violet-500 font-bold">{totals.protein}g pro</p>
            <p className="text-[9px] text-slate-500 font-medium text-right">{totals.fat}g fat</p>
          </div>
        </div>
      )}
    </div>
  )
}
