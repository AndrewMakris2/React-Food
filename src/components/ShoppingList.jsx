import { useState, useMemo } from 'react'
import { ShoppingCart, Copy, Check, Printer, X, ChevronDown, ChevronUp } from 'lucide-react'

const CATEGORIES = [
  { key: 'Proteins',       emoji: '🥩', pattern: /chicken|beef|salmon|tuna|shrimp|turkey|pork|egg|tofu|steak|ground|fish|lamb|sausage|bacon|ham|bison|venison|cod|tilapia|halibut|tempeh|seitan/i },
  { key: 'Produce',        emoji: '🥦', pattern: /onion|garlic|tomato|pepper|broccoli|spinach|lettuce|avocado|lime|lemon|kale|cucumber|carrot|potato|zucchini|mushroom|celery|apple|banana|berry|mango|corn|peas|bean|edamame|asparagus|cabbage|cauliflower|beet|fennel|artichoke/i },
  { key: 'Dairy',          emoji: '🥛', pattern: /milk|cheese|yogurt|butter|cream|cottage|whey|casein|mozzarella|cheddar|parmesan|ricotta|feta|ghee/i },
  { key: 'Grains & Carbs', emoji: '🌾', pattern: /rice|pasta|bread|oat|quinoa|tortilla|wrap|noodle|flour|cracker|cereal|bagel|pita|couscous|barley|farro|polenta/i },
  { key: 'Pantry',         emoji: '🫙', pattern: /oil|salt|sauce|vinegar|honey|maple|soy|mustard|mayo|sriracha|ketchup|dressing|broth|stock|coconut aminos|balsamic|worcestershire|fish sauce|oyster sauce|tahini/i },
  { key: 'Spices & Herbs', emoji: '🌿', pattern: /cumin|paprika|oregano|basil|thyme|cinnamon|turmeric|curry|chili|cayenne|powder|seasoning|herb|spice|rosemary|sage|dill|ginger|pepper|coriander|cardamom|bay leaf/i },
]

function categorize(ingredient) {
  for (const cat of CATEGORIES) {
    if (cat.pattern.test(ingredient)) return cat.key
  }
  return 'Other'
}

function parseIngredients(recipes) {
  const all = []
  recipes.forEach(recipe => {
    const source = recipe.name || 'Unknown'
    const ingredients = recipe.ingredients || []
    ingredients.forEach(ing => {
      all.push({ text: ing, source, category: categorize(ing) })
    })
  })
  return all
}

function groupByCategory(ingredients) {
  const grouped = {}
  ingredients.forEach(item => {
    if (!grouped[item.category]) grouped[item.category] = []
    grouped[item.category].push(item)
  })
  // Sort categories by CATEGORIES order, then Other
  const ordered = {}
  CATEGORIES.forEach(c => { if (grouped[c.key]) ordered[c.key] = grouped[c.key] })
  if (grouped['Other']) ordered['Other'] = grouped['Other']
  return ordered
}

function formatForCopy(grouped) {
  const lines = ['🛒 Shopping List — ProteinFuel', '']
  Object.entries(grouped).forEach(([cat, items]) => {
    lines.push(`${CATEGORIES.find(c => c.key === cat)?.emoji || '📦'} ${cat}`)
    items.forEach(i => lines.push(`  • ${i.text}`))
    lines.push('')
  })
  return lines.join('\n')
}

export default function ShoppingList({ recipes, onClose }) {
  const [checked,   setChecked]   = useState(new Set())
  const [copied,    setCopied]    = useState(false)
  const [collapsed, setCollapsed] = useState(new Set())
  const [sourceFilter, setSourceFilter] = useState('All')

  const homeCooked = recipes.filter(r => r.type === 'home_cooked')
  const sources    = ['All', ...new Set(homeCooked.map(r => r.name))]

  const filtered = sourceFilter === 'All' ? homeCooked : homeCooked.filter(r => r.name === sourceFilter)
  const ingredients = useMemo(() => parseIngredients(filtered), [filtered])
  const grouped     = useMemo(() => groupByCategory(ingredients), [ingredients])
  const total       = ingredients.length
  const done        = [...checked].filter(k => ingredients.some((_, i) => i === k)).length

  function toggleCheck(idx) {
    setChecked(prev => {
      const next = new Set(prev)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })
  }

  function toggleCollapse(cat) {
    setCollapsed(prev => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
  }

  async function copyList() {
    await navigator.clipboard.writeText(formatForCopy(grouped))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function printList() {
    const content = formatForCopy(grouped)
    const w = window.open('', '_blank')
    w.document.write(`<pre style="font-family:system-ui;font-size:14px;padding:24px;white-space:pre-wrap">${content}</pre>`)
    w.document.close()
    w.print()
  }

  if (homeCooked.length === 0) {
    return (
      <div className="text-center py-10">
        <ShoppingCart className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <p className="text-slate-500 dark:text-slate-400 text-sm">No home cooked recipes saved yet.</p>
        <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Save some home cooked meals to generate a shopping list.</p>
      </div>
    )
  }

  let globalIdx = 0

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-indigo-500" />
            Shopping List
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {done} of {total} items checked
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyList}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={printList}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>
          {onClose && (
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Source filter */}
      {sources.length > 2 && (
        <div className="flex flex-wrap gap-1.5">
          {sources.map(s => (
            <button
              key={s}
              onClick={() => setSourceFilter(s)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                sourceFilter === s
                  ? 'bg-indigo-500 border-indigo-500 text-white'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Progress bar */}
      {total > 0 && (
        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-300"
            style={{ width: `${(done / total) * 100}%` }}
          />
        </div>
      )}

      {/* Ingredient groups */}
      <div className="space-y-3">
        {Object.entries(grouped).map(([cat, items]) => {
          const catInfo   = CATEGORIES.find(c => c.key === cat)
          const isCollapsed = collapsed.has(cat)
          const catDone   = items.filter((_, i) => {
            const gi = globalIdx + i
            return checked.has(gi)
          }).length

          return (
            <div key={cat} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
              <button
                onClick={() => toggleCollapse(cat)}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{catInfo?.emoji || '📦'}</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{cat}</span>
                  <span className="text-[10px] text-slate-400">({catDone}/{items.length})</span>
                </div>
                {isCollapsed ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-400" />}
              </button>
              {!isCollapsed && (
                <ul className="border-t border-slate-200 dark:border-slate-700/50 divide-y divide-slate-100 dark:divide-slate-700/30">
                  {items.map((item, i) => {
                    const gi = globalIdx + i
                    const isChecked = checked.has(gi)
                    return (
                      <li
                        key={gi}
                        onClick={() => toggleCheck(gi)}
                        className={`flex items-start gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                          isChecked ? 'bg-slate-100/50 dark:bg-slate-700/30' : 'hover:bg-white dark:hover:bg-slate-700/20'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                          isChecked
                            ? 'bg-indigo-500 border-indigo-500'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {isChecked && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs sm:text-sm transition-colors ${
                            isChecked ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-300'
                          }`}>
                            {item.text}
                          </p>
                          {filtered.length > 1 && (
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{item.source}</p>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
              {/* advance global index */}
              {(() => { globalIdx += items.length; return null })()}
            </div>
          )
        })}
      </div>

      {done === total && total > 0 && (
        <div className="text-center py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/40">
          <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">🎉 All items checked! Happy cooking.</p>
        </div>
      )}
    </div>
  )
}
