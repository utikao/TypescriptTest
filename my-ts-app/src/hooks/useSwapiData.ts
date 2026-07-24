import { useReducer, useEffect } from 'react'
import type { Movie } from '../Cards/MovieCard'
import type { Starship } from '../Cards/StarshipCard'
import type { Planet } from '../Cards/PlanetCard'

// --- TYPES & INTERFACES ---
export type Tab = 'films' | 'starships' | 'planets'
export type SwapiItem = Movie | Starship | Planet

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

// --- REDUCER SETUP ---
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

// --- CUSTOM HOOK ---
export function useSwapiData(onFetchSuccess?: () => void) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState)
  const { activeTab, data, loading, error, selectedManufacturer } = state

  // Helper actions to expose to the component
  const setTab = (tab: Tab) => dispatch({ type: 'SET_TAB', payload: tab })
  const setManufacturer = (manufacturer: string) =>
    dispatch({ type: 'SET_MANUFACTURER', payload: manufacturer })

  useEffect(() => {
    const controller = new AbortController()

    const fetchData = async () => {
      dispatch({ type: 'FETCH_INIT' })

      try {
        const res = await fetch(`https://swapi.info/api/${activeTab}`, {
          signal: controller.signal,
        })

        if (!res.ok) {
          throw new Error(`HTTP status ${res.status}: Failed to fetch ${activeTab}`)
        }

        const json: SwapiItem[] = await res.json()

        if (activeTab === 'films') {
          ;(json as Movie[]).sort((a, b) => a.episode_id - b.episode_id)
        }

        dispatch({ type: 'FETCH_SUCCESS', payload: json })

        // Trigger the optional callback (used to focus the search bar)
        if (onFetchSuccess) onFetchSuccess()
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return

        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to communicate with SWAPI server.'

        dispatch({ type: 'FETCH_FAILURE', payload: errorMessage })
      }
    }

    fetchData()

    return () => controller.abort()
  }, [activeTab, onFetchSuccess])

  return {
    activeTab,
    data,
    loading,
    error,
    selectedManufacturer,
    setTab,
    setManufacturer,
  }
}