import { useState, useEffect, useCallback, useMemo } from 'react'
import { AlertCircle, BookmarkCheck, Search } from 'lucide-react'
import Header from './components/Header'
import SearchForm from './components/SearchForm'
import ResultsSection from './components/ResultsSection'
import { geocodeCity } from './utils/nominatim'
import { fetchProspects } from './utils/overpass'
import { loadSavedProspects, addSearchEntry } from './utils/storage'

export default function App() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searched, setSearched] = useState(false)
  const [searchParams, setSearchParams] = useState(null)
  const [savedProspects, setSavedProspects] = useState({})
  const [showSaved, setShowSaved] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())

  useEffect(() => {
    setSavedProspects(loadSavedProspects())
  }, [])

  const refreshSaved = useCallback(() => {
    setSavedProspects({ ...loadSavedProspects() })
  }, [])

  const handleSearch = useCallback(async ({ city, categoryIds, radius, phoneOnly, gpsLocation }) => {
    setLoading(true)
    setError(null)
    setResults([])
    setSearched(false)
    setShowSaved(false)
    setSelectedIds(new Set())

    try {
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

      const radiusMeters = radius * 1000
      let prospects = await fetchProspects(location.lat, location.lon, radiusMeters, categoryIds)

      if (phoneOnly) {
        prospects = prospects.filter((p) => p.phone)
      }

      setResults(prospects)
      setSearched(true)
      const searchCity = location.displayName || city
      setSearchParams({
        city: searchCity,
        totalFound: prospects.length,
        phoneOnly,
      })

      addSearchEntry({ city: searchCity, categoryIds, radius, phoneOnly })
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
  }, [])

  const handleToggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const displayResults = useMemo(
    () => (showSaved ? results.filter((p) => savedProspects[p.id]) : results),
    [results, showSaved, savedProspects],
  )

  const savedCount = useMemo(
    () => results.filter((p) => savedProspects[p.id]).length,
    [results, savedProspects],
  )

  return (
    <div className="min-h-screen bg-surface">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SearchForm onSearch={handleSearch} loading={loading} />

        {/* Error */}
        {error && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <div role="alert" className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm font-sans">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="mt-8 space-y-4 animate-fade-in">
            <div className="flex gap-3">
              <div className="h-11 w-36 rounded-xl skeleton-pulse" />
              <div className="h-11 w-40 rounded-xl skeleton-pulse" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5 space-y-3">
                  <div className="flex gap-2">
                    <div className="h-5 w-24 rounded-full skeleton-pulse" />
                    <div className="h-5 w-20 rounded-full skeleton-pulse" />
                  </div>
                  <div className="h-5 w-3/4 rounded skeleton-pulse" />
                  <div className="h-4 w-full rounded skeleton-pulse" />
                  <div className="h-4 w-1/2 rounded skeleton-pulse" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && searched && (
          <div className="mt-10">
            {/* Tabs: All results / Saved */}
            <nav role="tablist" aria-label="Filtre des résultats" className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] w-fit mb-6">
              <button
                role="tab"
                aria-selected={!showSaved}
                onClick={() => setShowSaved(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium font-sans transition-all duration-200 ${
                  !showSaved
                    ? 'bg-brand-500/20 text-brand-300 shadow-sm'
                    : 'text-white/40 hover:text-white/60'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                Tous les r&eacute;sultats
              </button>
              <button
                role="tab"
                aria-selected={showSaved}
                onClick={() => setShowSaved(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium font-sans transition-all duration-200 ${
                  showSaved
                    ? 'bg-brand-500/20 text-brand-300 shadow-sm'
                    : 'text-white/40 hover:text-white/60'
                }`}
              >
                <BookmarkCheck className="w-3.5 h-3.5" />
                Sauvegard&eacute;s
                {savedCount > 0 && (
                  <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300">
                    {savedCount}
                  </span>
                )}
              </button>
            </nav>

            <ResultsSection
              key={showSaved ? 'saved' : 'all'}
              results={displayResults}
              searchParams={searchParams}
              savedProspects={savedProspects}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onSavedChange={refreshSaved}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/20 font-sans">
            <p>
              ProspectRadar &middot; Donn&eacute;es{' '}
              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/30 hover:text-white/60 transition-colors"
              >
                &copy; OpenStreetMap contributors
              </a>
            </p>
            <a
              href="https://johnfullstack.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/30 hover:text-white/60 transition-colors"
            >
              Jonathan N.
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
