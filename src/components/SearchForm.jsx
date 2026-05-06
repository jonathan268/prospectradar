import { useState } from 'react'
import { Search, MapPin, LocateFixed, Loader2, Target, Zap, Users } from 'lucide-react'
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

const FEATURES = [
  { icon: Target, title: 'Prospects qualifiés', desc: 'Entreprises sans site web, facile à convaincre' },
  { icon: Zap, title: 'Rapide', desc: 'Résultats en quelques secondes' },
  { icon: Users, title: 'Gratuit', desc: 'Aucune limite, aucune inscription' },
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
    <div className="relative">
      {/* Hero Section */}
      <div className="text-center mb-10 pt-6">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          <Zap className="w-4 h-4" />
          <span>100% Gratuit · Sans inscription</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-base-content leading-tight mb-4">
          Trouve tes{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
            prochains clients
          </span>{' '}
          avant eux
        </h1>
        
        <p className="text-base-content/60 text-lg sm:text-xl max-w-2xl mx-auto mb-8">
          ProspectRadar identifie les entreprises locales sans site web. 
          Des prospects qualifiés qui ont besoin de toi.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
          <button
            onClick={() => document.getElementById('search-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn btn-primary btn-lg gap-2 font-semibold px-8"
          >
            <Search className="w-5 h-5" />
            Commencer maintenant
          </button>
          <button
            onClick={handleGeolocate}
            className="btn btn-outline btn-lg gap-2 font-medium px-8"
          >
            <LocateFixed className="w-5 h-5" />
            Autour de moi
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {FEATURES.map((feature, i) => (
            <div key={i} className="flex items-center gap-3 p-4 bg-base-200/50 rounded-2xl border border-base-300/50">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-base-content text-sm">{feature.title}</p>
                <p className="text-base-content/50 text-xs">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search Form Card */}
      <div id="search-form" className="card bg-base-200/80 backdrop-blur-sm shadow-2xl border border-base-300/50 rounded-3xl">
        <div className="card-body p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Ville */}
            <div>
              <label className="label pb-1">
                <span className="label-text font-medium text-base-content/80 text-sm">
                  Ville ou zone de prospection
                </span>
              </label>
              <div className="join w-full">
                <div className="join-item flex items-center pl-4 bg-base-100 border border-base-300 border-r-0 rounded-l-xl">
                  <MapPin className="w-4 h-4 text-base-content/40" />
                </div>
                <input
                  type="text"
                  className="input input-bordered join-item flex-1 bg-base-100 font-normal text-sm focus:outline-none focus:border-primary rounded-r-xl"
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
                  className={`btn join-item btn-ghost border border-base-300 border-l-0 rounded-r-xl tooltip tooltip-left`}
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
              className="btn btn-primary w-full gap-2 font-semibold btn-lg"
              disabled={loading || !city.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Recherche en cours...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
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
    </div>
  )
}