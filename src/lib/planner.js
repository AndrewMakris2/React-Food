const KEY = 'proteinfuel-planner'

export const DAYS  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export const SLOTS = ['Breakfast', 'Lunch', 'Dinner', 'Snack']

function emptyPlan() {
  const plan = {}
  DAYS.forEach(d => {
    plan[d] = {}
    SLOTS.forEach(s => { plan[d][s] = null })
  })
  return plan
}

export function getPlan() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || 'null') || emptyPlan()
  } catch { return emptyPlan() }
}

export function setSlot(day, slot, meal) {
  const plan = getPlan()
  if (!plan[day]) plan[day] = {}
  plan[day][slot] = meal
  localStorage.setItem(KEY, JSON.stringify(plan))
  return plan
}

export function clearSlot(day, slot) {
  return setSlot(day, slot, null)
}

export function clearPlan() {
  localStorage.removeItem(KEY)
}

export function getDayTotals(dayPlan) {
  return SLOTS.reduce((acc, slot) => {
    const m = dayPlan?.[slot]
    if (!m) return acc
    const parse = v => parseInt(String(v || '0').replace(/[^0-9]/g, '')) || 0
    acc.protein  += parse(m.protein)
    acc.calories += parse(m.calories)
    acc.carbs    += parse(m.carbs)
    acc.fat      += parse(m.fat)
    return acc
  }, { protein: 0, calories: 0, carbs: 0, fat: 0 })
}
