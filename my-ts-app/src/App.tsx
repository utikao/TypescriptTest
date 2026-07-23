import {
  useState,
  useReducer,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  type ChangeEvent,
} from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import MovieCard, { type Movie } from './Cards/MovieCard'
import StarshipCard, { type Starship } from './Cards/StarshipCard'
import PlanetCard, { type Planet } from './Cards/PlanetCard'
import { useTheme } from './ThemeContext'

// --- TYPES & INTERFACES ---
export type Tab = 'films' | 'starships' | 'planets'

type SwapiItem = Movie | Starship | Planet

// --- REDUCER TYPES ---
interface DashboardState {
  activeTab: Tab
  data: SwapiItem[]
  loading: boolean
  error: string | null
  selectedManufacturer: string
}

type DashboardAction =
  | { type: 'SET_TAB'; payload: Tab }
  | { type: 'FETCH_INIT' }
  | { type: 'FETCH_SUCCESS'; payload: SwapiItem[] }
  | { type: 'FETCH_FAILURE'; payload: string }
  | { type: 'SET_MANUFACTURER'; payload: string }

// --- REDUCER FUNCTION ---
const initialState: DashboardState = {
  activeTab: 'films',
  data: [],
  loading: true,
  error: null,
  selectedManufacturer: 'All',
}

function dashboardReducer(
  state: DashboardState,
  action: DashboardAction
): DashboardState {
  switch (action.type) {
    case 'SET_TAB':
      if (state.activeTab === action.payload) return state

      return {
        ...state,
        activeTab: action.payload,
        selectedManufacturer: 'All',
        loading: true,
        error: null,
      }
    case 'FETCH_INIT':
      return { ...state, loading: true, error: null }
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, data: action.payload, error: null }
    case 'FETCH_FAILURE':
      return { ...state, loading: false, error: action.payload }
    case 'SET_MANUFACTURER':
      return { ...state, selectedManufacturer: action.payload }
    default:
      return state
  }
}

function App() {
  // --- HOOK 1: useContext (Global Theme Context) ---
  const { theme, toggleTheme } = useTheme()

  // --- HOOK 2: useReducer (Complex Dashboard & Fetching State) ---
  const [state, dispatch] = useReducer(dashboardReducer, initialState)
  const { activeTab, data, loading, error, selectedManufacturer } = state

  // --- HOOK 3: useState (UI Local Search & Favorites State) ---
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [favorites, setFavorites] = useState<string[]>([])

  // --- HOOK 4: useRef (DOM Reference for Auto-Focus) ---
  const searchInputRef = useRef<HTMLInputElement>(null)

  // --- TAB SWITCH HANDLER ---
  const handleTabChange = (newTab: Tab) => {
    if (newTab === activeTab) return
    setSearchQuery('')
    dispatch({ type: 'SET_TAB', payload: newTab })
  }

  // --- HOOK 5: useEffect (Data Fetching with Race Condition Guard) ---
  useEffect(() => {
    const controller = new AbortController()
    dispatch({ type: 'FETCH_INIT' })

    fetch(`https://swapi.info/api/${activeTab}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('Network response failed')
        return res.json()
      })
      .then((json: SwapiItem[]) => {
        if (activeTab === 'films') {
          ;(json as Movie[]).sort((a, b) => a.episode_id - b.episode_id)
        }
        dispatch({ type: 'FETCH_SUCCESS', payload: json })
        searchInputRef.current?.focus()
      })
      .catch((err: Error) => {
        if (err.name === 'AbortError') return
        dispatch({
          type: 'FETCH_FAILURE',
          payload: err.message || 'Failed to communicate with SWAPI server.',
        })
      })

    return () => controller.abort()
  }, [activeTab])

  // --- HOOK 6: useCallback (Memoized Function Reference) ---
  const toggleFavorite = useCallback((itemName: string) => {
    setFavorites((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName]
    )
  }, [])

  // --- HOOK 7: useMemo (Memoized Data Calculations) ---
  const manufacturerOptions = useMemo((): string[] => {
    if (activeTab !== 'starships') return []

    const manufacturers = (data as Starship[])
      .map((ship) => ship.manufacturer)
      .filter(Boolean)

    return ['All', ...Array.from(new Set(manufacturers))].sort()
  }, [data, activeTab])

  const filteredData = useMemo((): SwapiItem[] => {
    let result = data

    // Apply manufacturer dropdown filter
    if (activeTab === 'starships' && selectedManufacturer !== 'All') {
      result = (result as Starship[]).filter(
        (ship) => ship.manufacturer === selectedManufacturer
      )
    }

    // Apply search input query filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase()
      result = result.filter((item) => {
        const nameOrTitle = 'title' in item ? item.title : item.name
        return nameOrTitle.toLowerCase().includes(q)
      })
    }

    return result
  }, [data, activeTab, selectedManufacturer, searchQuery])

  const getHeaderTitle = (): string => {
    switch (activeTab) {
      case 'films':
        return 'Galactic Films Archive'
      case 'starships':
        return 'Starship Registry'
      case 'planets':
        return 'Planetary Index'
    }
  }

  // --- USER INTERFACE (JSX) ---
  return (
    <div className={`dashboard-layout theme-${theme}`}>
      {/* --- SIDEBAR PANEL --- */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src={reactLogo} className="logo" alt="React logo" />
          <h2>SWAPI App</h2>
        </div>
        <nav className="sidebar-menu">
          <button
            disabled={loading}
            className={`menu-item ${activeTab === 'films' ? 'active' : ''}`}
            onClick={() => handleTabChange('films')}
          >
            🎬 Films
          </button>
          <button
            disabled={loading}
            className={`menu-item ${activeTab === 'starships' ? 'active' : ''}`}
            onClick={() => handleTabChange('starships')}
          >
            🚀 Starships
          </button>
          <button
            disabled={loading}
            className={`menu-item ${activeTab === 'planets' ? 'active' : ''}`}
            onClick={() => handleTabChange('planets')}
          >
            🌍 Planets
          </button>
        </nav>
      </aside>

      {/* --- MAIN DISPLAY DASHBOARD --- */}
      <main className="main-content">
        <header className="content-header">
          <div className="header-title-area">
            <h1>{getHeaderTitle()}</h1>
            <p>Browsing dynamic structural data via Swapi</p>
          </div>

          <div className="controls-row">
            {/* --- THEME TOGGLE (useContext) --- */}
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              title="Toggle Light/Dark Mode"
            >
              {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>

            {/* --- SEARCH INPUT WITH useRef --- */}
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
              className="search-input"
            />

            {/* --- DYNAMIC FILTER DROPDOWN --- */}
            {activeTab === 'starships' && !loading && (
              <div className="filter-container">
                <label htmlFor="manufacturer-select">Manufacturer: </label>
                <select
                  id="manufacturer-select"
                  value={selectedManufacturer}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    dispatch({
                      type: 'SET_MANUFACTURER',
                      payload: e.target.value,
                    })
                  }
                  className="filter-dropdown"
                >
                  {manufacturerOptions.map((vendor) => (
                    <option key={vendor} value={vendor}>
                      {vendor}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </header>

        {/* --- DATA VIEWPORTS --- */}
        <section id="display-section">
          {loading ? (
            <p className="loading-text">Dropping out of hyperspace...</p>
          ) : error ? (
            <p className="error-text">⚠️ Error: {error}</p>
          ) : filteredData.length === 0 ? (
            <p className="no-results">No items found matching that filter.</p>
          ) : (
            <div className="movies-grid">
              {activeTab === 'films' ? (
                (filteredData as Movie[]).map((movie, index) => {
                  const isFav = favorites.includes(movie.title)
                  return (
                    <div key={`film-${index}`} className="card-wrapper">
                      <button
                        className={`fav-button ${isFav ? 'active' : ''}`}
                        onClick={() => toggleFavorite(movie.title)}
                      >
                        {isFav ? '★' : '☆'}
                      </button>
                      <MovieCard movie={movie} />
                    </div>
                  )
                })
              ) : activeTab === 'starships' ? (
                (filteredData as Starship[]).map((starship, index) => {
                  const isFav = favorites.includes(starship.name)
                  return (
                    <div key={`ship-${index}`} className="card-wrapper">
                      <button
                        className={`fav-button ${isFav ? 'active' : ''}`}
                        onClick={() => toggleFavorite(starship.name)}
                      >
                        {isFav ? '★' : '☆'}
                      </button>
                      <StarshipCard starship={starship} />
                    </div>
                  )
                })
              ) : (
                (filteredData as Planet[]).map((planet, index) => {
                  const isFav = favorites.includes(planet.name)
                  return (
                    <div key={`planet-${index}`} className="card-wrapper">
                      <button
                        className={`fav-button ${isFav ? 'active' : ''}`}
                        onClick={() => toggleFavorite(planet.name)}
                      >
                        {isFav ? '★' : '☆'}
                      </button>
                      <PlanetCard planet={planet} />
                    </div>
                  )
                })
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App