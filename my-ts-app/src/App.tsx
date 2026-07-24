import {
  useState,
  useMemo,
  useRef,
  useCallback,
  type ChangeEvent,
} from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import MovieCard, { type Movie } from './Cards/MovieCard'
import StarshipCard, { type Starship } from './Cards/StarshipCard'
import PlanetCard, { type Planet } from './Cards/PlanetCard'
import { useTheme } from './ThemeContext'
import { useFavorites } from './hooks/useFavorites'
import { useSwapiData, type Tab, type SwapiItem } from './hooks/useSwapiData'

function App() {
  // --- HOOK 1: Global Theme ---
  const { theme, toggleTheme } = useTheme()

  // --- HOOK 2: Local UI State (Search & Focus) ---
  const [searchQuery, setSearchQuery] = useState<string>('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Memoize the focus callback so it doesn't trigger extra fetches
  const handleFetchSuccess = useCallback(() => {
    searchInputRef.current?.focus()
  }, [])

  // --- HOOK 3: Data Fetching (Extracted!) ---
  const {
    activeTab,
    data,
    loading,
    error,
    selectedManufacturer,
    setTab,
    setManufacturer,
  } = useSwapiData(handleFetchSuccess)

  // --- HOOK 4: Persistent Favorites (Extracted!) ---
  const { favorites, toggleFavorite } = useFavorites()

  // --- TAB SWITCH HANDLER ---
  const handleTabChange = (newTab: Tab) => {
    if (newTab === activeTab) return
    setSearchQuery('')
    setTab(newTab)
  }

  // --- MEMOIZED DATA CALCULATIONS ---
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
            {/* --- THEME TOGGLE --- */}
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              title="Toggle Light/Dark Mode"
            >
              {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>

            {/* --- SEARCH INPUT --- */}
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
                    setManufacturer(e.target.value)
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
                (filteredData as Movie[]).map((movie) => {
                  const isFav = favorites.includes(movie.title)
                  return (
                    <div key={`film-${movie.episode_id}`} className="card-wrapper">
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
                (filteredData as Starship[]).map((starship) => {
                  const isFav = favorites.includes(starship.name)
                  return (
                    <div key={`ship-${starship.name}`} className="card-wrapper">
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
                (filteredData as Planet[]).map((planet) => {
                  const isFav = favorites.includes(planet.name)
                  return (
                    <div key={`planet-${planet.name}`} className="card-wrapper">
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