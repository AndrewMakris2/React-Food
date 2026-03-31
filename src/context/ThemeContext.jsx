import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('proteinfuel-theme')
    const dark  = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
    // Apply synchronously to prevent white flash on first render
    document.documentElement.classList.toggle('dark', dark)
    return dark
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('proteinfuel-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme: () => setIsDark(d => !d) }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
