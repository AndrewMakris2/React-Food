const KEY      = 'proteinfuel-recipes'
const MAX_SAVED = 100   // cap to keep localStorage lean

export function getRecipes() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') }
  catch { return [] }
}

export function addRecipe(meal) {
  const recipes = getRecipes()
  const recipe  = { ...meal, id: crypto.randomUUID(), savedAt: new Date().toISOString() }
  const updated = [recipe, ...recipes].slice(0, MAX_SAVED)
  localStorage.setItem(KEY, JSON.stringify(updated))
  return recipe
}

export function removeRecipe(id) {
  const updated = getRecipes().filter(r => r.id !== id)
  localStorage.setItem(KEY, JSON.stringify(updated))
}

export function clearAllRecipes() {
  localStorage.removeItem(KEY)
}
