import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  type FC,
} from 'react'

// --- TYPES & INTERFACES ---
export type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

interface ThemeProviderProps {
  children: ReactNode
}

// 1. CREATE CONTEXT
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// 2. PROVIDER COMPONENT
export const ThemeProvider: FC<ThemeProviderProps> = ({ children }) => {
  // Initialize state from LocalStorage or default to 'dark'
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('swapi_theme')
    return (savedTheme as Theme) || 'dark'
  })

  // Sync theme changes with LocalStorage and HTML document attribute for CSS styling
  useEffect(() => {
    localStorage.setItem('swapi_theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// 3. CUSTOM CONSUMER HOOK
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}