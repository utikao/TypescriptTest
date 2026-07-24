import { useState, useEffect, useCallback } from 'react'

export function useFavorites(storageKey: string = 'swapi_favorites') {
  // 1. Initialize from localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // 2. Sync to localStorage whenever favorites change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(favorites))
    } catch (e) {
      console.warn('Failed to save favorites to localStorage:', e)
    }
  }, [favorites, storageKey])

  // 3. Memoized toggle function
  const toggleFavorite = useCallback((itemName: string) => {
    setFavorites((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName]
    )
  }, [])

  return { favorites, toggleFavorite }
}