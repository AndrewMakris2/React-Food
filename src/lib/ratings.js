const RATINGS_KEY = 'proteinfuel-ratings'
const NOTES_KEY   = 'proteinfuel-notes'

// ── Ratings ──────────────────────────────────────────────────
export function getRating(id) {
  try {
    return JSON.parse(localStorage.getItem(RATINGS_KEY) || '{}')[id] || 0
  } catch { return 0 }
}

export function setRating(id, stars) {
  try {
    const all = JSON.parse(localStorage.getItem(RATINGS_KEY) || '{}')
    if (stars === 0) delete all[id]
    else all[id] = stars
    localStorage.setItem(RATINGS_KEY, JSON.stringify(all))
  } catch {}
}

export function getAllRatings() {
  try { return JSON.parse(localStorage.getItem(RATINGS_KEY) || '{}') }
  catch { return {} }
}

// ── Notes ─────────────────────────────────────────────────────
export function getNote(id) {
  try {
    return JSON.parse(localStorage.getItem(NOTES_KEY) || '{}')[id] || ''
  } catch { return '' }
}

export function setNote(id, text) {
  try {
    const all = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}')
    const trimmed = (text || '').trim()
    if (!trimmed) delete all[id]
    else all[id] = trimmed
    localStorage.setItem(NOTES_KEY, JSON.stringify(all))
  } catch {}
}

export function getAllNotes() {
  try { return JSON.parse(localStorage.getItem(NOTES_KEY) || '{}') }
  catch { return {} }
}
