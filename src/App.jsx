import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import Header from './components/Header'
import SearchForm from './components/SearchForm'
import ResultsSection from './components/ResultsSection'
import { geocodeCity } from './utils/nominatim'
import { fetchProspects } from './utils/overpass'

export default function App() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searched, setSearched] = useState(false)
  const [searchParams, setSearchParams] = useState(null)

  const handleSearch = async ({ city, categoryId, radius, phoneOnly, gpsLocation }) => {
    setLoading(true)
    setError(null)
    setResults([])
    setSearched(false)

    try {
      // Géocodage : GPS direct ou Nominatim
      let location
      if (gpsLocation) {
        location = gpsLocation
      } else {
        location = await geocodeCity(city)
        if (!location) {
          setError(`Ville introuvable : "${city}". Essaie un nom plus précis ou une ville voisine.`)
          setLoading(false)
          return
        }
      }

      // Requête Overpass
      const radiusMeters = radius * 1000
      let prospects = await fetchProspects(location.lat, location.lon, radiusMeters, categoryId)

      // Filtre téléphone si demandé
      if (phoneOnly) {
        prospects = prospects.filter((p) => p.phone)
      }

      setResults(prospects)
      setSearched(true)
      setSearchParams({
        city: location.displayName || city,
        totalFound: prospects.length,
        phoneOnly,
      })
    } catch (err) {
      console.error(err)
      if (err.message.includes('429') || err.message.includes('504')) {
        setError("Le serveur OpenStreetMap est temporairement surchargé. Réessaie dans quelques secondes.")
      } else {
        setError("Erreur de connexion. Vérifie ta connexion internet et réessaie.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-base-100">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <SearchForm onSearch={handleSearch} loading={loading} />

        {/* Erreur */}
        {error && (
          <div className="alert alert-error mt-6 shadow">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="mt-8 space-y-4">
            <div className="flex gap-3">
              <div className="skeleton h-10 w-36 rounded-xl"></div>
              <div className="skeleton h-10 w-40 rounded-xl"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card bg-base-200 border border-base-300">
                  <div className="card-body p-4 gap-3">
                    <div className="flex gap-2">
                      <div className="skeleton h-5 w-24 rounded-full"></div>
                      <div className="skeleton h-5 w-20 rounded-full"></div>
                    </div>
                    <div className="skeleton h-5 w-3/4 rounded"></div>
                    <div className="skeleton h-4 w-full rounded"></div>
                    <div className="skeleton h-4 w-1/2 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Résultats */}
        {!loading && searched && (
          <ResultsSection results={results} searchParams={searchParams} />
        )}
      </main>

      {/* Footer */}
      <footer className="footer footer-center p-6 bg-base-200 border-t border-base-300 mt-16 text-base-content/40 text-xs font-light">
        <p>
          ProspectRadar · Données{' '}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary"
          >
            © OpenStreetMap contributors
          </a>
          <a
            href="https://johnfullstack.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className=" hover:text-primary"
          >
            Jonathan N.
          </a>
          
          
        </p>
      </footer>
    </div>
  )
}
