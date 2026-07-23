import React from 'react'

// --- TYPES & INTERFACES ---
export interface Movie {
  title: string
  episode_id: number
  director: string
  release_date: string
  opening_crawl?: string
  starships?: string[]
  planets?: string[]
}

interface MovieCardProps {
  movie: Movie
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  return (
    <div className="movie-card">
      <div className="card-header">
        <span className="episode-badge">Episode {movie.episode_id}</span>
        <h3>{movie.title}</h3>
      </div>

      <div className="card-body">
        <p className="director-info">
          <strong>Director:</strong> {movie.director}
        </p>
        <p className="release-info">
          <strong>Released:</strong>{' '}
          {new Date(movie.release_date).toLocaleDateString()}
        </p>

        {/* Safe check using optional chaining and fallback string */}
        <p className="opening-crawl">
          {movie.opening_crawl
            ? movie.opening_crawl.substring(0, 120) + '...'
            : 'No opening crawl available.'}
        </p>
      </div>

      <div className="card-footer">
        {/* Safe checks for optional array lengths */}
        <span>🚀 {movie.starships?.length || 0} Starships</span>
        <span>🌍 {movie.planets?.length || 0} Planets</span>
      </div>
    </div>
  )
}

export default MovieCard