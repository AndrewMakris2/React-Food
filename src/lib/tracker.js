const LOG_KEY   = 'proteinfuel-tracker-log'
const GOALS_KEY = 'proteinfuel-tracker-goals'

export function getTodayKey() {
  return new Date().toISOString().split('T')[0]  // YYYY-MM-DD
}

export function getLog(date = getTodayKey()) {
  try {
    const all = JSON.parse(localStorage.getItem(LOG_KEY) || '{}')
    return all[date] || []
  } catch { return [] }
}

export function addLogEntry(entry, date = getTodayKey()) {
  try {
    const all = JSON.parse(localStorage.getItem(LOG_KEY) || '{}')
    const day = all[date] || []
    const newEntry = {
      ...entry,
      id: crypto.randomUUID(),
      loggedAt: new Date().toISOString(),
    }
    // Keep only last 30 days
    const keys = Object.keys(all).sort()
    if (keys.length >= 30) delete all[keys[0]]
    all[date] = [...day, newEntry]
    localStorage.setItem(LOG_KEY, JSON.stringify(all))
    return all[date]
  } catch { return [] }
}

export function removeLogEntry(id, date = getTodayKey()) {
  try {
    const all = JSON.parse(localStorage.getItem(LOG_KEY) || '{}')
    all[date] = (all[date] || []).filter(e => e.id !== id)
    localStorage.setItem(LOG_KEY, JSON.stringify(all))
    return all[date]
  } catch { return [] }
}

export function clearDayLog(date = getTodayKey()) {
  try {
    const all = JSON.parse(localStorage.getItem(LOG_KEY) || '{}')
    delete all[date]
    localStorage.setItem(LOG_KEY, JSON.stringify(all))
  } catch {}
}

export function getGoals() {
  try {
    const g = JSON.parse(localStorage.getItem(GOALS_KEY) || 'null')
    return g || { protein: 150, calories: 2000, carbs: 200, fat: 70 }
  } catch {
    return { protein: 150, calories: 2000, carbs: 200, fat: 70 }
  }
}

export function saveGoals(goals) {
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals))
}
