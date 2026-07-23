import React from 'react'

export interface Planet {
  name: string
  climate?: string
  terrain?: string
  population?: string
  diameter?: string
  gravity?: string
  url?: string
}

interface PlanetCardProps {
  planet: Planet
}

// Helper function to turn "2000000000" into "2,000,000,000"
const formatPopulation = (population?: string): string => {
  if (!population || population === 'unknown') return 'Unknown'
  const num = Number(population)
  return isNaN(num) ? population : num.toLocaleString()
}

export const PlanetCard: React.FC<PlanetCardProps> = ({ planet }) => {
  return (
    <div className="movie-card">
      <div className="card-header">
        <span className="episode-badge class-badge">
          {planet.climate || 'Unknown Climate'}
        </span>
        <h3>{planet.name}</h3>
      </div>
      <div className="card-body">
        <p>
          <strong>Terrain:</strong> {planet.terrain || 'Unknown'}
        </p>
        <p>
          <strong>Population:</strong> {formatPopulation(planet.population)}
        </p>
      </div>
    </div>
  )
}

export default PlanetCard