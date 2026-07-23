import React from 'react'

// --- TYPES & INTERFACES ---
export interface Starship {
  name: string
  model: string
  manufacturer: string
  cost_in_credits: string
  max_atmosphering_speed: string
  crew: string
  passengers: string
  starship_class: string
}

interface StarshipCardProps {
  starship: Starship
}

const StarshipCard: React.FC<StarshipCardProps> = ({ starship }) => {
  return (
    <div className="movie-card starship-card">
      <div className="card-header">
        <span className="episode-badge">{starship.starship_class}</span>
        <h3>{starship.name}</h3>
      </div>

      <div className="card-body">
        <p className="director-info">
          <strong>Model:</strong> {starship.model}
        </p>
        <p className="director-info">
          <strong>Manufacturer:</strong> {starship.manufacturer}
        </p>
        <p className="release-info">
          <strong>Cost:</strong> {starship.cost_in_credits} credits
        </p>
        <p className="release-info">
          <strong>Max Speed:</strong> {starship.max_atmosphering_speed}
        </p>
      </div>

      <div className="card-footer">
        <span>👥 Crew: {starship.crew}</span>
        <span>👥 Pass: {starship.passengers}</span>
      </div>
    </div>
  )
}

export default StarshipCard