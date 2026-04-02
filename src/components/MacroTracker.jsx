import { useState, useCallback } from 'react'
import { Plus, Trash2, Target, RotateCcw, ChevronDown, ChevronUp, Check, Edit2 } from 'lucide-react'
import { getLog, addLogEntry, removeLogEntry, clearDayLog, getGoals, saveGoals, getTodayKey } from '../lib/tracker'
import { getRecipes } from '../lib/recipes'

// SVG progress ring
function Ring({ value, max, size = 88, strokeWidth = 7, className = '' }) {
  const r    = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const pct  = max > 0 ? Math.min(1, value / max) : 0
  return (
    <svg width={size} height={size} className={className}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={strokeWidth} className="stroke-slate-100 dark:stroke-slate-800" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={strokeWidth}
        strokeDasharray={`${pct * circ} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="transition-all duration-700"
        style={{ stroke: 'currentColor' }}
      />
    </svg>
  )
}

function parseMacro(v) {
  return parseInt(String(v || '0').replace(/[^0-9]/g, '')) || 0
}

const MACRO_COLORS = {
  protein:  'text-violet-500',
  calories: 'text-orange-500',
  carbs:    'text-amber-500',
  fat:      'text-rose-500',
}

function RingCard({ label, value, goal, color }) {
  const pct = goal > 0 ? Math.round(Math.min(100, (value / goal) * 100)) : 0
  const over = value > goal && goal > 0
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <Ring value={value} max={goal} size={80} strokeWidth={7} className={over ? 'text-red-400' : color} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-sm font-extrabold tabular-nums ${over ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
            {value}
          </span>
        </div>
      </div>
      <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-[10px] text-slate-400 dark:text-slate-500">{pct}% of {goal}</p>
    </div>
  )
}

export default function MacroTracker() {
  const [log,         setLog]         = useState(() => getLog())
  const [goals,       setGoals]       = useState(() => getGoals())
  const [editGoals,   setEditGoals]   = useState(false)
  const [draftGoals,  setDraftGoals]  = useState(() => getGoals())
  const [showAdd,     setShowAdd]     = useState(false)
  const [addMode,     setAddMode]     = useState('saved')   // 'saved' | 'custom'
  const [customName,  setCustomName]  = useState('')
  const [customMacros, setCustomMacros] = useState({ protein: '', calories: '', carbs: '', fat: '' })
  const [savedSearch, setSavedSearch] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)

  const savedRecipes = getRecipes().filter(r => r.type === 'home_cooked')

  const totals = log.reduce((acc, e) => {
    acc.protein  += parseMacro(e.protein)
    acc.calories += parseMacro(e.calories)
    acc.carbs    += parseMacro(e.carbs)
    acc.fat      += parseMacro(e.fat)
    return acc
  }, { protein: 0, calories: 0, carbs: 0, fat: 0 })

  function saveGoalsHandler() {
    saveGoals(draftGoals)
    setGoals(draftGoals)
    setEditGoals(false)
  }

  function addFromSaved(recipe) {
    const updated = addLogEntry({
      name:     recipe.name,
      protein:  recipe.protein,
      calories: recipe.calories,
      carbs:    recipe.carbs,
      fat:      recipe.fat,
    })
    setLog(updated)
    setShowAdd(false)
    setSavedSearch('')
  }

  function addCustom() {
    if (!customName.trim()) return
    const updated = addLogEntry({
      name:     customName.trim(),
      protein:  customMacros.protein  || '0',
      calories: customMacros.calories || '0',
      carbs:    customMacros.carbs    || '0',
      fat:      customMacros.fat      || '0',
    })
    setLog(updated)
    setCustomName('')
    setCustomMacros({ protein: '', calories: '', carbs: '', fat: '' })
    setShowAdd(false)
  }

  function removeEntry(id) {
    setLog(removeLogEntry(id))
  }

  function clearAll() {
    clearDayLog()
    setLog([])
    setConfirmClear(false)
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const filteredSaved = savedRecipes.filter(r =>
    r.name.toLowerCase().includes(savedSearch.toLowerCase())
  )

  return (
    <div className="space-y-4 sm:space-y-5">

      {/* Date header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">Daily Tracker</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{today}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setDraftGoals(goals); setEditGoals(v => !v) }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-300 transition-colors"
          >
            <Target className="w-3.5 h-3.5" /> Goals
          </button>
          {!confirmClear ? (
            <button
              onClick={() => setConfirmClear(true)}
              className="px-2 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors"
              title="Clear today's log"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 rounded-xl px-2.5 py-1.5">
              <span className="text-[11px] text-red-600 dark:text-red-400 font-medium">Clear?</span>
              <button onClick={clearAll} className="text-[11px] font-bold text-red-600 dark:text-red-400">Yes</button>
              <span className="text-red-300">·</span>
              <button onClick={() => setConfirmClear(false)} className="text-[11px] text-slate-500">No</button>
            </div>
          )}
        </div>
      </div>

      {/* Goal editor */}
      {editGoals && (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-700/50 p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Daily Goals</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { key: 'protein',  label: 'Protein (g)',   color: 'focus:ring-violet-400/50' },
              { key: 'calories', label: 'Calories (kcal)', color: 'focus:ring-orange-400/50' },
              { key: 'carbs',    label: 'Carbs (g)',     color: 'focus:ring-amber-400/50' },
              { key: 'fat',      label: 'Fat (g)',       color: 'focus:ring-rose-400/50' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{f.label}</label>
                <input
                  type="number" inputMode="numeric"
                  value={draftGoals[f.key]}
                  onChange={e => setDraftGoals(prev => ({ ...prev, [f.key]: parseInt(e.target.value) || 0 }))}
                  className={`w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 ${f.color}`}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={saveGoalsHandler} className="flex-1 py-2 rounded-xl bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-600 transition-colors">
              Save Goals
            </button>
            <button onClick={() => setEditGoals(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Progress rings */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-700/50 p-4 sm:p-6 shadow-sm">
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          <RingCard label="Protein"  value={totals.protein}  goal={goals.protein}  color={MACRO_COLORS.protein}  />
          <RingCard label="Calories" value={totals.calories} goal={goals.calories} color={MACRO_COLORS.calories} />
          <RingCard label="Carbs"    value={totals.carbs}    goal={goals.carbs}    color={MACRO_COLORS.carbs}    />
          <RingCard label="Fat"      value={totals.fat}      goal={goals.fat}      color={MACRO_COLORS.fat}      />
        </div>
        {/* Macro bars */}
        <div className="mt-4 space-y-2">
          {[
            { key: 'protein',  label: 'Protein',  color: 'bg-violet-500'  },
            { key: 'calories', label: 'Calories', color: 'bg-orange-500'  },
            { key: 'carbs',    label: 'Carbs',    color: 'bg-amber-500'   },
            { key: 'fat',      label: 'Fat',      color: 'bg-rose-500'    },
          ].map(m => {
            const pct = goals[m.key] > 0 ? Math.min(100, (totals[m.key] / goals[m.key]) * 100) : 0
            return (
              <div key={m.key} className="flex items-center gap-3">
                <span className="text-[10px] font-semibold text-slate-500 w-12 flex-shrink-0">{m.label}</span>
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${pct > 100 ? 'bg-red-400' : m.color}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 tabular-nums w-16 text-right flex-shrink-0">
                  {totals[m.key]} / {goals[m.key]}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Log entries */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Today's Log {log.length > 0 && <span className="text-indigo-500 normal-case font-normal">({log.length} entries)</span>}
          </p>
          <button
            onClick={() => setShowAdd(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition-colors shadow-sm shadow-indigo-500/25"
          >
            <Plus className="w-3.5 h-3.5" /> Add Meal
          </button>
        </div>

        {/* Add meal panel */}
        {showAdd && (
          <div className="border-b border-slate-200 dark:border-slate-700/50 p-4 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex gap-2 mb-3">
              {[{ key: 'saved', label: 'From Saved Recipes' }, { key: 'custom', label: 'Custom Entry' }].map(m => (
                <button
                  key={m.key}
                  onClick={() => setAddMode(m.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    addMode === m.key
                      ? 'bg-indigo-500 border-indigo-500 text-white'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {addMode === 'saved' ? (
              <div>
                <input
                  value={savedSearch}
                  onChange={e => setSavedSearch(e.target.value)}
                  placeholder="Search saved recipes…"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                {filteredSaved.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-3">No saved home cooked recipes found.</p>
                ) : (
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {filteredSaved.map(r => (
                      <button
                        key={r.id}
                        onClick={() => addFromSaved(r)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white dark:hover:bg-slate-700/50 transition-colors text-left"
                      >
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{r.name}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0 ml-2">{r.protein} protein · {r.calories} cal</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder="Meal name (e.g. Protein shake)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                <div className="grid grid-cols-4 gap-2">
                  {['protein', 'calories', 'carbs', 'fat'].map(k => (
                    <div key={k}>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{k}</label>
                      <input
                        type="number" inputMode="numeric"
                        value={customMacros[k]}
                        onChange={e => setCustomMacros(prev => ({ ...prev, [k]: e.target.value }))}
                        placeholder="0"
                        className="w-full px-2 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={addCustom}
                  className="w-full py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition-colors"
                >
                  Add Entry
                </button>
              </div>
            )}
          </div>
        )}

        {/* Log list */}
        {log.length === 0 ? (
          <div className="text-center py-10 text-slate-400 dark:text-slate-500">
            <p className="text-sm">No meals logged today.</p>
            <p className="text-xs mt-1">Hit "Add Meal" to start tracking.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/30">
            {log.map(entry => (
              <div key={entry.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{entry.name}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                    {[
                      { label: 'protein', val: entry.protein,  color: 'text-violet-500' },
                      { label: 'cal',     val: entry.calories, color: 'text-orange-500' },
                      { label: 'carbs',   val: entry.carbs,    color: 'text-amber-500'  },
                      { label: 'fat',     val: entry.fat,      color: 'text-rose-500'   },
                    ].map(m => (
                      <span key={m.label} className={`text-[10px] sm:text-xs font-semibold ${m.color}`}>
                        {m.val} <span className="font-normal text-slate-400">{m.label}</span>
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => removeEntry(entry.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
