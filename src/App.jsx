import { useState } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import Header from './components/Header'
import MealGenerator from './components/MealGenerator'
import SavedRecipes from './components/SavedRecipes'
import MacroTracker from './components/MacroTracker'
import WeeklyPlanner from './components/WeeklyPlanner'
import { getRecipes } from './lib/recipes'

function AppContent() {
  const [activeTab,     setActiveTab]     = useState('generator')
  const [generatedMeal, setGeneratedMeal] = useState(null)
  const [savedCount,    setSavedCount]    = useState(() => getRecipes().length)

  function handleSaved()        { setSavedCount(c => c + 1) }
  function handleDelete()       { setSavedCount(c => Math.max(0, c - 1)) }
  function handleClearAll(n)    { setSavedCount(prev => Math.max(0, prev - n)) }

  return (
    <div className="min-h-screen bg-grid-light transition-colors duration-300">
      {/* Ambient glow blobs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden hidden sm:block">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-400/10 dark:bg-indigo-600/8 blur-3xl" />
        <div className="absolute -top-20 right-0 w-80 h-80 rounded-full bg-violet-400/10 dark:bg-violet-600/8 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-64 rounded-full bg-indigo-300/5 dark:bg-indigo-700/5 blur-3xl" />
      </div>

      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedCount}
      />

      <main className="relative max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-5 sm:py-8">
        {activeTab === 'generator' && (
          <MealGenerator
            generatedMeal={generatedMeal}
            setGeneratedMeal={setGeneratedMeal}
            onSaved={handleSaved}
          />
        )}
        {activeTab === 'planner' && <WeeklyPlanner />}
        {activeTab === 'tracker' && <MacroTracker />}
        {activeTab === 'saved' && (
          <SavedRecipes
            onDelete={handleDelete}
            onClearAll={handleClearAll}
          />
        )}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}
