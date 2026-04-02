import { useState } from 'react'
import { ChevronDown, ChevronUp, Calculator, Zap } from 'lucide-react'

const ACTIVITY_LEVELS = [
  { value: 1.2,   label: 'Sedentary',   desc: 'Desk job, little/no exercise' },
  { value: 1.375, label: 'Light',        desc: 'Light exercise 1–3×/week' },
  { value: 1.55,  label: 'Moderate',     desc: 'Moderate exercise 3–5×/week' },
  { value: 1.725, label: 'Active',        desc: 'Hard exercise 6–7×/week' },
  { value: 1.9,   label: 'Very Active',   desc: 'Hard training + physical job' },
]

const GOALS = [
  { value: 'lose',     label: 'Lose Fat',      calMult: 0.8,  proteinPerLb: 1.0,  color: 'text-orange-500' },
  { value: 'maintain', label: 'Maintain',       calMult: 1.0,  proteinPerLb: 0.8,  color: 'text-indigo-500' },
  { value: 'build',    label: 'Build Muscle',   calMult: 1.1,  proteinPerLb: 1.2,  color: 'text-emerald-500' },
]

function calcBMR({ sex, weightKg, heightCm, age }) {
  const base = (10 * weightKg) + (6.25 * heightCm) - (5 * age)
  return sex === 'male' ? base + 5 : base - 161
}

export default function TDEECalculator({ onApply }) {
  const [open,     setOpen]     = useState(false)
  const [unit,     setUnit]     = useState('imperial')  // 'imperial' | 'metric'
  const [sex,      setSex]      = useState('male')
  const [weightLb, setWeightLb] = useState('180')
  const [weightKg, setWeightKg] = useState('82')
  const [feet,     setFeet]     = useState('5')
  const [inches,   setInches]   = useState('10')
  const [heightCm, setHeightCm] = useState('178')
  const [age,      setAge]      = useState('25')
  const [activity, setActivity] = useState(1.55)
  const [goal,     setGoal]     = useState('build')
  const [result,   setResult]   = useState(null)

  function calculate() {
    const wKg = unit === 'imperial' ? parseFloat(weightLb) * 0.453592 : parseFloat(weightKg)
    const hCm = unit === 'imperial'
      ? (parseInt(feet) * 12 + parseInt(inches)) * 2.54
      : parseFloat(heightCm)
    const a = parseInt(age)
    if (!wKg || !hCm || !a) return

    const bmr  = calcBMR({ sex, weightKg: wKg, heightCm: hCm, age: a })
    const tdee = Math.round(bmr * activity)
    const g    = GOALS.find(g => g.value === goal)
    const targetCal     = Math.round(tdee * g.calMult)
    const weightForProt = unit === 'imperial' ? parseFloat(weightLb) : parseFloat(weightKg) * 2.205
    const targetProtein = Math.round(weightForProt * g.proteinPerLb)
    const targetCarbs   = Math.round((targetCal * 0.4) / 4)
    const targetFat     = Math.round((targetCal * 0.25) / 9)

    setResult({ tdee, targetCal, targetProtein, targetCarbs, targetFat })
  }

  function apply() {
    if (!result) return
    onApply?.({
      protein:  String(result.targetProtein),
      calories: String(result.targetCal),
      carbs:    String(result.targetCarbs),
      fat:      String(result.targetFat),
    })
    setOpen(false)
  }

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-700/50 overflow-hidden shadow-sm">
      {/* Toggle header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
            <Calculator className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <p className="font-bold text-slate-900 dark:text-white text-sm">TDEE & Macro Calculator</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Auto-fill your targets based on your body stats</p>
          </div>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        }
      </button>

      {open && (
        <div className="border-t border-slate-200 dark:border-slate-700/50 p-4 sm:p-6 space-y-5">

          {/* Unit toggle */}
          <div className="flex items-center gap-2">
            {['imperial', 'metric'].map(u => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  unit === u
                    ? 'bg-amber-500 border-amber-500 text-white'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {u === 'imperial' ? 'lbs / ft' : 'kg / cm'}
              </button>
            ))}
          </div>

          {/* Inputs grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

            {/* Sex */}
            <div className="col-span-2 sm:col-span-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Sex</label>
              <div className="flex gap-1.5">
                {['male', 'female'].map(s => (
                  <button
                    key={s}
                    onClick={() => setSex(s)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all capitalize ${
                      sex === s
                        ? 'bg-amber-500 border-amber-500 text-white'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Age */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Age</label>
              <input
                type="number" inputMode="numeric" value={age} onChange={e => setAge(e.target.value)} min="10" max="100"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                placeholder="25"
              />
            </div>

            {/* Weight */}
            {unit === 'imperial' ? (
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Weight (lbs)</label>
                <input
                  type="number" inputMode="numeric" value={weightLb} onChange={e => setWeightLb(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  placeholder="180"
                />
              </div>
            ) : (
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Weight (kg)</label>
                <input
                  type="number" inputMode="numeric" value={weightKg} onChange={e => setWeightKg(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  placeholder="82"
                />
              </div>
            )}

            {/* Height */}
            {unit === 'imperial' ? (
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Height</label>
                <div className="flex gap-1">
                  <input
                    type="number" inputMode="numeric" value={feet} onChange={e => setFeet(e.target.value)} min="4" max="7"
                    className="w-full px-2 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    placeholder="5"
                  />
                  <input
                    type="number" inputMode="numeric" value={inches} onChange={e => setInches(e.target.value)} min="0" max="11"
                    className="w-full px-2 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    placeholder="10"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">ft / in</p>
              </div>
            ) : (
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Height (cm)</label>
                <input
                  type="number" inputMode="numeric" value={heightCm} onChange={e => setHeightCm(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  placeholder="178"
                />
              </div>
            )}
          </div>

          {/* Activity level */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Activity Level</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {ACTIVITY_LEVELS.map(a => (
                <button
                  key={a.value}
                  onClick={() => setActivity(a.value)}
                  className={`px-2 py-2 rounded-xl border text-[10px] sm:text-[11px] font-semibold text-center transition-all ${
                    activity === a.value
                      ? 'bg-amber-500 border-amber-500 text-white'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-amber-300'
                  }`}
                >
                  <span className="block">{a.label}</span>
                  <span className="block text-[9px] opacity-70 mt-0.5 leading-tight hidden sm:block">{a.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Goal */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Goal</p>
            <div className="grid grid-cols-3 gap-2">
              {GOALS.map(g => (
                <button
                  key={g.value}
                  onClick={() => setGoal(g.value)}
                  className={`py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    goal === g.value
                      ? 'bg-amber-500 border-amber-500 text-white'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-amber-300'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Calculate button */}
          <button
            onClick={calculate}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold text-sm shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 active:scale-[0.99] transition-all"
          >
            Calculate My TDEE
          </button>

          {/* Results */}
          {result && (
            <div className="rounded-xl border border-amber-200 dark:border-amber-700/40 bg-amber-50 dark:bg-amber-900/10 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">Maintenance TDEE</p>
                  <p className="text-2xl font-extrabold text-amber-700 dark:text-amber-300">{result.tdee.toLocaleString()} <span className="text-sm font-normal">kcal/day</span></p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">Target Calories</p>
                  <p className="text-2xl font-extrabold text-amber-700 dark:text-amber-300">{result.targetCal.toLocaleString()} <span className="text-sm font-normal">kcal</span></p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { label: 'Protein', value: result.targetProtein, unit: 'g', color: 'text-violet-600 dark:text-violet-400' },
                  { label: 'Calories', value: result.targetCal, unit: 'kcal', color: 'text-orange-600 dark:text-orange-400' },
                  { label: 'Carbs', value: result.targetCarbs, unit: 'g', color: 'text-amber-600 dark:text-amber-400' },
                  { label: 'Fat', value: result.targetFat, unit: 'g', color: 'text-rose-600 dark:text-rose-400' },
                ].map(m => (
                  <div key={m.label} className="text-center bg-white dark:bg-slate-800/50 rounded-lg p-2">
                    <p className={`text-lg font-extrabold ${m.color}`}>{m.value}</p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wider">{m.unit}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{m.label}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={apply}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:from-indigo-600 hover:to-violet-700 transition-all shadow-md shadow-indigo-500/25"
              >
                <Zap className="w-4 h-4" />
                Apply to Generator
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
