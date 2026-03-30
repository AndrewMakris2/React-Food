import { Sun, Moon, Dumbbell } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function Header({ activeTab, setActiveTab, savedCount }) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700/50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
            Protein<span className="text-indigo-500">Fuel</span>
          </span>
        </div>

        {/* Tabs */}
        <nav className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'generator'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            Generator
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`relative px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'saved'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            Saved
            {savedCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] font-bold">
                {savedCount > 9 ? '9+' : savedCount}
              </span>
            )}
          </button>
        </nav>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors flex-shrink-0"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  )
}
