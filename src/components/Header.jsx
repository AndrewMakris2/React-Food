import { Sun, Moon, Dumbbell, Zap, Calendar, BarChart2, Bookmark } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const TABS = [
  { id: 'generator', label: 'Generator', Icon: Zap      },
  { id: 'planner',   label: 'Planner',   Icon: Calendar },
  { id: 'tracker',   label: 'Tracker',   Icon: BarChart2 },
  { id: 'saved',     label: 'Saved',     Icon: Bookmark  },
]

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
          <div className="hidden sm:block">
            <span className="font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight leading-none">
              Protein<span className="text-indigo-500">Fuel</span>
            </span>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-none mt-0.5">AI Meal Planner</p>
          </div>
        </button>

        {/* Tabs — scrollable on mobile, no scrollbar shown */}
        <nav className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 overflow-x-auto scrollbar-none flex-1 max-w-xs sm:max-w-none sm:flex-none">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-[11px] sm:text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                  isActive
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <tab.Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 ${isActive ? 'text-indigo-500' : ''}`} />
                <span className="hidden xs:inline">{tab.label}</span>
                {tab.id === 'saved' && savedCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-indigo-500 text-white text-[9px] sm:text-[10px] font-bold">
                    {savedCount > 99 ? '99+' : savedCount}
                  </span>
                )}
              </button>
            )
          })}
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
