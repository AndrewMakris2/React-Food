import { Sun, Moon, Dumbbell } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function Header({ activeTab, setActiveTab, savedCount }) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700/50">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">

        {/* Logo */}
        <button
          onClick={() => setActiveTab('generator')}
          className="flex items-center gap-2 flex-shrink-0 group"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 flex-shrink-0 group-hover:shadow-indigo-500/40 transition-shadow">
            <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="hidden xs:block sm:block">
            <span className="font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight leading-none">
              Protein<span className="text-indigo-500">Fuel</span>
            </span>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-none mt-0.5 hidden sm:block">
              AI Meal Planner
            </p>
          </div>
        </button>

        {/* Tabs */}
        <nav className="flex items-center gap-0.5 sm:gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
          {[
            { id: 'generator', label: 'Generator' },
            { id: 'saved',     label: 'Saved'     },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
              {tab.id === 'saved' && savedCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-500 text-white text-[10px] font-bold">
                  {savedCount > 99 ? '99+' : savedCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex-shrink-0"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  )
}
