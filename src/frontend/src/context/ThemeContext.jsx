import { createContext, useContext, useEffect } from 'react'

const ThemeContext = createContext({
  theme: 'light',
  isDark: false,
  toggleTheme: () => {},
})

export function ThemeProvider({ children }) {
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', 'light')
    root.classList.add('light')
    root.classList.remove('dark')
    try {
      localStorage.removeItem('tideline_theme')
    } catch {
      // ignore
    }
  }, [])

  return (
    <ThemeContext.Provider value={{ theme: 'light', isDark: false, toggleTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    return { theme: 'light', isDark: false, toggleTheme: () => {} }
  }
  return context
}
