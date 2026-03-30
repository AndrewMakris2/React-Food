import { useState } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import Header from './components/Header'
import MealGenerator from './components/MealGenerator'
import SavedRecipes from './components/SavedRecipes'

function AppContent() {
  const [activeTab, setActiveTab] = useState('generator')
  const [generatedMeal, setGeneratedMeal] = useState(null)
  const [savedCount, setSavedCount] = useState(0)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedCount}
      />
      <main className="max-w-5xl mx-auto px-4 py-8">
        {activeTab === 'generator' ? (
          <MealGenerator
            generatedMeal={generatedMeal}
            setGeneratedMeal={setGeneratedMeal}
            onSaved={() => setSavedCount(c => c + 1)}
          />
        ) : (
          <SavedRecipes onDelete={() => setSavedCount(c => Math.max(0, c - 1))} />
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
