const KEY = 'proteinfuel-recipes'

export function getRecipes() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export function addRecipe(meal) {
  const recipes = getRecipes()
  const recipe = { ...meal, id: crypto.randomUUID(), savedAt: new Date().toISOString() }
  recipes.unshift(recipe)
  localStorage.setItem(KEY, JSON.stringify(recipes))
  return recipe
}

export function removeRecipe(id) {
  const updated = getRecipes().filter(r => r.id !== id)
  localStorage.setItem(KEY, JSON.stringify(updated))
}
