import { useState, useRef, useEffect } from 'react'
import {
  Search, MapPin, LocateFixed, Loader2, Target, Zap, Users,
  ArrowRight, Crosshair, ChevronDown, Check, Clock, RotateCcw,
} from 'lucide-react'
import { CATEGORIES } from '../utils/categories'
import { getBrowserLocation, reverseGeocode } from '../utils/nominatim'
import { loadSearchHistory, clearSearchHistory } from '../utils/storage'

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

export default function SearchForm({ onSearch, loading, onHistorySelect }) {
  const [city, setCity] = useState('')
  const [categoryIds, setCategoryIds] = useState(['all'])
  const [radius, setRadius] = useState(5)
  const [phoneOnly, setPhoneOnly] = useState(false)
  const [locating, setLocating] = useState(false)
  const [gpsLocation, setGpsLocation] = useState(null)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState([])
  const dropdownRef = useRef(null)
  const historyRef = useRef(null)

  useEffect(() => {
    setHistory(loadSearchHistory())
  }, [])

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowCategoryDropdown(false)
      }
      if (historyRef.current && !historyRef.current.contains(e.target)) {
        setShowHistory(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

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
      categoryIds,
      radius,
      phoneOnly,
      gpsLocation,
    })
  }

  const toggleCategory = (id) => {
    if (id === 'all') {
      setCategoryIds(['all'])
      return
    }
    let next = categoryIds.filter((c) => c !== 'all')
    if (next.includes(id)) {
      next = next.filter((c) => c !== id)
    } else {
      next = [...next, id]
    }
    setCategoryIds(next.length === 0 ? ['all'] : next)
  }

  const displayLabel = categoryIds.includes('all')
    ? 'Tous les commerces'
    : `${categoryIds.length} s&eacute;lectionn&eacute;(e)s`

  const handleHistoryClick = (entry) => {
    setCity(entry.city)
    setCategoryIds(entry.categoryIds || ['all'])
    setRadius(entry.radius || 5)
    setPhoneOnly(entry.phoneOnly || false)
    setShowHistory(false)
    if (onHistorySelect) onHistorySelect(entry)
  }

  const handleClearHistory = () => {
    clearSearchHistory()
    setHistory([])
  }

  return (
    <section aria-label="Recherche de prospects" className="relative pt-28 pb-16">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-sm font-medium mb-6 animate-fade-in">
          <Zap className="w-3.5 h-3.5" />
          <span>100% Gratuit &middot; Sans inscription</span>
        </div>

        <h2 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.1] mb-5 animate-slide-up">
          <span className="text-gradient">Trouve tes</span>
          <br />
          <span className="text-gradient-brand">prochains clients</span>
          <br />
          <span className="text-gradient">avant eux</span>
          </h2>

        <p className="text-white/40 text-base sm:text-lg max-w-xl mx-auto mb-10 font-sans font-normal leading-relaxed animate-slide-up">
          ProspectRadar identifie les entreprises locales sans site web.
          Des prospects qualifi&eacute;s qui ont besoin de toi.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14 animate-slide-up">
          <button
            onClick={() => document.getElementById('search-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="group relative inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-violet-500 text-white font-semibold text-sm hover:from-brand-400 hover:to-violet-400 transition-all duration-300 shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40"
          >
            <Search className="w-4 h-4" />
            Commencer maintenant
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={handleGeolocate}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl glass-hover text-white/80 hover:text-white font-medium text-sm transition-all duration-300"
          >
            <Crosshair className="w-4 h-4" />
            Autour de moi
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto animate-fade-in">
          {FEATURES.map((feature, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5 rounded-xl glass">
              <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
                <feature.icon className="w-4 h-4 text-brand-400" />
              </div>
              <div className="text-left">
                <p className="font-display font-semibold text-white text-sm">{feature.title}</p>
                <p className="text-white/40 text-xs font-sans">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search Form */}
      <div id="search-form" className="max-w-2xl mx-auto animate-slide-up">
        <div className="gradient-border rounded-2xl">
          <div className="relative rounded-2xl bg-surface-100/80 backdrop-blur-xl p-6 sm:p-8">
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-brand-400/30 to-transparent" />

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* City */}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2 font-sans">
                  Ville ou zone de prospection
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center pointer-events-none">
                    <MapPin className="w-4 h-4 text-white/30" />
                  </div>
                  <input
                    type="text"
                    className="w-full h-11 pl-10 pr-20 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-white/20 font-sans outline-none focus:border-brand-500/50 focus:bg-white/[0.06] transition-all duration-200"
                    placeholder="Ex : Yaound&eacute;, Paris, Dakar..."
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value)
                      setGpsLocation(null)
                    }}
                    onFocus={() => setShowHistory(true)}
                    required
                  />
                  <div className="absolute right-1.5 flex items-center gap-1">
                    {history.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowHistory(!showHistory)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white/20 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
                        title="Historique"
                      >
                        <Clock className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white/20 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
                      onClick={handleGeolocate}
                      disabled={locating}
                      title="Ma position GPS"
                    >
                      {locating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <LocateFixed className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* History dropdown */}
                {showHistory && history.length > 0 && (
                  <div
                    ref={historyRef}
                    className="absolute z-40 mt-1 w-full max-w-md rounded-xl bg-surface-200 border border-white/[0.08] shadow-2xl overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
                      <span className="text-xs font-medium text-white/40 font-sans">Historique</span>
                      <button
                        onClick={handleClearHistory}
                        className="text-[11px] text-white/30 hover:text-white/60 font-sans transition-colors"
                      >
                        Effacer
                      </button>
                    </div>
                    {history.map((entry, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleHistoryClick(entry)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.04] transition-colors border-b border-white/[0.03] last:border-0"
                      >
                        <Clock className="w-3.5 h-3.5 text-white/20 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-white/70 font-sans truncate">{entry.city}</p>
                          <p className="text-[11px] text-white/30 font-sans">
                            {CATEGORIES.find((c) => c.id === (entry.categoryIds?.[0] || 'all'))?.label || 'Tous'} &middot; {entry.radius || 5} km
                            {entry.phoneOnly ? ' &middot; T&eacute;l. uniquement' : ''}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Category multi-select + Radius */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative" ref={dropdownRef}>
                  <label className="block text-sm font-medium text-white/60 mb-2 font-sans">
                    Cat&eacute;gorie
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className="w-full h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-sans px-3.5 outline-none flex items-center justify-between transition-all duration-200 cursor-pointer hover:bg-white/[0.06]"
                  >
                    <span className="truncate">{displayLabel}</span>
                    <ChevronDown className={`w-4 h-4 text-white/30 transition-transform duration-200 ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showCategoryDropdown && (
                    <div className="absolute z-40 mt-1 w-full rounded-xl bg-surface-200 border border-white/[0.08] shadow-2xl overflow-hidden">
                      <div className="max-h-56 overflow-y-auto py-1">
                        <button
                          type="button"
                          onClick={() => toggleCategory('all')}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors text-left"
                        >
                          <div className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                            categoryIds.includes('all') ? 'bg-brand-500' : 'border border-white/30'
                          }`}>
                            {categoryIds.includes('all') && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-sm text-white/80 font-sans">Tous les commerces</span>
                        </button>
                        <div className="mx-3 my-1 h-px bg-white/[0.06]" />
                        {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => toggleCategory(cat.id)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors text-left"
                          >
                            <div className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                              categoryIds.includes(cat.id) ? 'bg-brand-500' : 'border border-white/30'
                            }`}>
                              {categoryIds.includes(cat.id) && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className="text-sm text-white/70 font-sans">{cat.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2 font-sans">
                    Rayon de recherche
                  </label>
                  <select
                    className="w-full h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-sans px-3.5 outline-none focus:border-brand-500/50 focus:bg-white/[0.06] transition-all duration-200 appearance-none cursor-pointer"
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                  >
                    {RADIUS_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value} className="bg-surface-100">
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Phone filter */}
              <label className="flex items-center gap-3 py-1 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={phoneOnly}
                    onChange={(e) => setPhoneOnly(e.target.checked)}
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors duration-200 ${
                    phoneOnly ? 'bg-brand-500' : 'bg-white/[0.08]'
                  }`}>
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 mt-1 ${
                      phoneOnly ? 'translate-x-5' : 'translate-x-1'
                    }`} />
                  </div>
                </div>
                <span className="text-sm text-white/50 group-hover:text-white/70 transition-colors font-sans">
                  Afficher uniquement les entreprises avec un num&eacute;ro de t&eacute;l&eacute;phone
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !city.trim()}
                className="relative w-full h-12 rounded-xl bg-gradient-to-r from-brand-500 to-violet-500 text-white font-semibold text-sm font-sans disabled:opacity-40 disabled:cursor-not-allowed hover:from-brand-400 hover:to-violet-400 transition-all duration-300 shadow-lg shadow-brand-500/20"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Recherche en cours...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Lancer la recherche
                  </span>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-white/20 font-sans mt-4">
              Donn&eacute;es OpenStreetMap &middot; Aucun compte requis &middot; Aucune limite
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
