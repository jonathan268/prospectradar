import { useState } from 'react'
import { Search, MapPin, LocateFixed, Loader2 } from 'lucide-react'
import { CATEGORIES } from '../utils/categories'
import { getBrowserLocation, reverseGeocode } from '../utils/nominatim'

const RADIUS_OPTIONS = [
  { value: 1, label: '1 km' },
  { value: 2, label: '2 km' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 20, label: '20 km' },
  { value: 50, label: '50 km' },
]

export default function SearchForm({ onSearch, loading }) {
  const [city, setCity] = useState('')
  const [categoryId, setCategoryId] = useState('all')
  const [radius, setRadius] = useState(5)
  const [phoneOnly, setPhoneOnly] = useState(false)
  const [locating, setLocating] = useState(false)
  const [gpsLocation, setGpsLocation] = useState(null)

  const handleGeolocate = async () => {
    setLocating(true)
    try {
      const coords = await getBrowserLocation()
      const loc = await reverseGeocode(coords.lat, coords.lon)
      setCity(loc.displayName)
      setGpsLocation(loc)
    } catch (err) {
      alert(err.message)
    } finally {
      setLocating(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!city.trim()) return
    onSearch({
      city: city.trim(),
      categoryId,
      radius,
      phoneOnly,
      gpsLocation,
    })
  }

  return (
    <div className="card bg-base-200 shadow-xl border border-base-300">
      <div className="card-body p-6">
        {/* Hero text */}
        <div className="text-center mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-base-content leading-tight">
            Identifie les entreprises{' '}
            <span className="text-primary">sans site web</span>
          </h1>
          <p className="text-base-content/60 text-sm mt-2 font-normal">
            Utilise OpenStreetMap pour trouver tes prochains clients. Gratuit, sans limite.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Ville */}
          <div>
            <label className="label pb-1">
              <span className="label-text font-medium text-base-content/80 text-sm">
                Ville ou zone de prospection
              </span>
            </label>
            <div className="join w-full">
              <div className="join-item flex items-center pl-4 bg-base-100 border border-base-300 border-r-0">
                <MapPin className="w-4 h-4 text-base-content/40" />
              </div>
              <input
                type="text"
                className="input input-bordered join-item flex-1 bg-base-100 font-normal text-sm focus:outline-none focus:border-primary"
                placeholder="Ex : Yaoundé, Paris, Dakar..."
                value={city}
                onChange={(e) => {
                  setCity(e.target.value)
                  setGpsLocation(null)
                }}
                required
              />
              <button
                type="button"
                className={`btn join-item btn-ghost border border-base-300 border-l-0 tooltip tooltip-left`}
                data-tip="Ma position GPS"
                onClick={handleGeolocate}
                disabled={locating}
              >
                {locating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LocateFixed className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Catégorie + Rayon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label pb-1">
                <span className="label-text font-medium text-base-content/80 text-sm">
                  Catégorie
                </span>
              </label>
              <select
                className="select select-bordered w-full bg-base-100 font-normal text-sm focus:outline-none focus:border-primary"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label pb-1">
                <span className="label-text font-medium text-base-content/80 text-sm">
                  Rayon de recherche
                </span>
              </label>
              <select
                className="select select-bordered w-full bg-base-100 font-normal text-sm focus:outline-none focus:border-primary"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
              >
                {RADIUS_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filtre téléphone */}
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-3 py-2">
              <input
                type="checkbox"
                className="checkbox checkbox-primary checkbox-sm"
                checked={phoneOnly}
                onChange={(e) => setPhoneOnly(e.target.checked)}
              />
              <span className="label-text text-sm font-normal">
                Afficher uniquement les entreprises avec un numéro de téléphone
              </span>
            </label>
          </div>

          {/* Bouton recherche */}
          <button
            type="submit"
            className="btn btn-primary w-full gap-2 font-semibold"
            disabled={loading || !city.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Recherche en cours...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Lancer la recherche
              </>
            )}
          </button>
        </form>

        {/* Info footer */}
        <p className="text-center text-xs text-base-content/40 mt-2 font-light">
          Données OpenStreetMap · Aucun compte requis · Aucune limite
        </p>
      </div>
    </div>
  )
}
