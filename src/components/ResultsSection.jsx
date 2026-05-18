import { memo, useState, useMemo } from 'react'
import {
  Download, Phone, Building2, Filter, TrendingUp,
  FileSpreadsheet, Search, ArrowUpDown, CheckSquare,
  Square, BarChart3, X, Share2, FileText, Map,
} from 'lucide-react'
import ProspectCard from './ProspectCard'
import EmptyState from './EmptyState'
import MapPanel from './MapPanel'
import { exportToCSV } from '../utils/exportCsv'
import { exportToPDF } from '../utils/exportPdf'
import { loadSavedProspects, saveProspect } from '../utils/storage'

const SORT_OPTIONS = [
  { value: 'name', label: 'Nom A-Z' },
  { value: 'name-desc', label: 'Nom Z-A' },
  { value: 'phone', label: 'Avec t&eacute;l&eacute;phone' },
  { value: 'category', label: 'Cat&eacute;gorie' },
]

const ResultsSection = memo(function ResultsSection({
  results, searchParams, savedProspects, onToggleSelect, selectedIds, onSavedChange,
}) {
  const { city, totalFound, phoneOnly } = searchParams
  const [filterText, setFilterText] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [showStats, setShowStats] = useState(false)
  const [showMap, setShowMap] = useState(false)

  const withPhone = results.filter((p) => p.phone).length

  const filtered = useMemo(() => {
    let list = [...results]

    if (filterText.trim()) {
      const q = filterText.toLowerCase().trim()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q) ||
          (p.address || '').toLowerCase().includes(q) ||
          (p.phone || '').includes(q)
      )
    }

    switch (sortBy) {
      case 'name':
        list.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-desc':
        list.sort((a, b) => b.name.localeCompare(a.name))
        break
      case 'phone':
        list.sort((a, b) => (b.phone ? 1 : 0) - (a.phone ? 1 : 0))
        break
      case 'category':
        list.sort((a, b) => (a.category || '').localeCompare(b.category || ''))
        break
    }

    return list
  }, [results, filterText, sortBy])

  const allSelected = filtered.length > 0 && selectedIds.size === filtered.length

  const handleSelectAll = () => {
    if (allSelected) {
      filtered.forEach((p) => onToggleSelect(p.id))
    } else {
      filtered.forEach((p) => {
        if (!selectedIds.has(p.id)) onToggleSelect(p.id)
      })
    }
  }

  const handleExport = () => {
    const selected = results.filter((p) => selectedIds.has(p.id))
    const toExport = selected.length > 0 ? selected : results
    exportToCSV(toExport, city, savedProspects)
  }

  const handleExportSelected = () => {
    const selected = results.filter((p) => selectedIds.has(p.id))
    if (selected.length > 0) {
      exportToCSV(selected, `${city}-selection`, savedProspects)
    }
  }

  // Stats
  const stats = useMemo(() => {
    const byCategory = {}
    results.forEach((p) => {
      const cat = p.category || 'Autre'
      byCategory[cat] = (byCategory[cat] || 0) + 1
    })
    const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1])
    return { byCategory: sorted, total: results.length, withPhone }
  }, [results, withPhone])

  if (results.length === 0) {
    return (
      <div className="mt-8">
        <EmptyState city={city} />
      </div>
    )
  }

  return (
    <>
    <section aria-label="Résultats de recherche" className="mt-10 space-y-6 animate-fade-in">
      {/* Top bar: stats + export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl glass">
            <div className="w-9 h-9 rounded-lg bg-brand-500/15 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-brand-400" />
            </div>
            <div>
              <span className="text-xl font-bold text-white font-display">
                {results.length}
              </span>
              <span className="text-sm text-white/40 font-sans ml-1.5">
                {results.length === 1 ? 'entreprise' : 'entreprises'}
              </span>
            </div>
          </div>

          {withPhone > 0 && (
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Phone className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-sm font-bold text-emerald-300">{withPhone}</span>
                <span className="text-xs text-emerald-300/60 font-sans ml-1">
                  avec t&eacute;l&eacute;phone
                </span>
              </div>
            </div>
          )}

          {phoneOnly && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-500/10 border border-brand-500/20">
              <Filter className="w-3.5 h-3.5 text-brand-400" />
              <span className="text-xs font-medium text-brand-300 font-sans">
                Avec t&eacute;l&eacute;phone uniquement
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMap(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.08] transition-all duration-200 text-sm font-medium font-sans"
          >
            <Map className="w-4 h-4" />
            Carte
          </button>
          <button
            onClick={() => setShowStats(!showStats)}
            className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium font-sans transition-all duration-200 ${
              showStats
                ? 'bg-brand-500/15 text-brand-300 border border-brand-500/25'
                : 'bg-white/[0.04] text-white/50 border border-white/[0.08] hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Stats
          </button>
          <button
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.08] transition-all duration-200 text-sm font-medium font-sans"
            onClick={() => {
              const toExport = selectedIds.size > 0
                ? results.filter((p) => selectedIds.has(p.id))
                : results
              exportToPDF(toExport, { city, phoneOnly, totalFound: results.length }, savedProspects)
            }}
          >
            <FileText className="w-4 h-4" />
            PDF
          </button>
          <button
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.08] transition-all duration-200 text-sm font-medium font-sans"
            onClick={handleExport}
          >
            <FileSpreadsheet className="w-4 h-4" />
            {selectedIds.size > 0 ? `CSV (${selectedIds.size})` : 'CSV'}
          </button>
        </div>
      </div>

      {/* Stats panel */}
      {showStats && stats.byCategory.length > 0 && (
        <div className="glass rounded-xl p-5 animate-fade-in">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider font-sans mb-3">
            R&eacute;partition par cat&eacute;gorie
          </h3>
          <div className="space-y-2">
            {stats.byCategory.map(([cat, count]) => (
              <div key={cat} className="flex items-center gap-3">
                <span className="text-sm text-white/60 font-sans w-36 sm:w-44 truncate">{cat}</span>
                <div className="flex-1 h-5 rounded-full bg-white/[0.04] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-all duration-500"
                    style={{ width: `${(count / stats.total) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-white/40 font-sans w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info bar */}
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl glass text-sm">
        <TrendingUp className="w-4 h-4 text-brand-400 shrink-0" />
        <span className="text-white/40 font-sans">
          R&eacute;sultats pour{' '}
          <span className="font-semibold text-white/70">{city}</span>
          {' '}&middot; Donn&eacute;es OpenStreetMap &middot; Toutes ces entreprises n&rsquo;ont pas de site web r&eacute;f&eacute;renc&eacute;
        </span>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Search className="w-4 h-4 text-white/20" />
          </div>
          <input
            type="text"
            className="w-full h-10 pl-9 pr-8 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-white/20 font-sans outline-none focus:border-brand-500/30 transition-all duration-200"
            placeholder="Filtrer par nom, adresse, t&eacute;l&eacute;phone..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
          {filterText && (
            <button
              onClick={() => setFilterText('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Sort */}
          <div className="relative">
            <select
              className="h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-sans px-3 pr-8 outline-none appearance-none cursor-pointer focus:border-brand-500/30 transition-all duration-200"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-surface-200" dangerouslySetInnerHTML={{ __html: opt.label }} />
              ))}
            </select>
            <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 pointer-events-none" />
          </div>

          {/* Select all */}
          <button
            onClick={handleSelectAll}
            className="h-10 px-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white hover:bg-white/[0.08] transition-all duration-200 flex items-center gap-2 text-sm font-sans"
          >
            {allSelected ? <CheckSquare className="w-4 h-4 text-brand-400" /> : <Square className="w-4 h-4" />}
            <span className="hidden sm:inline">{allSelected ? 'Tout d&eacute;s&eacute;lectionner' : 'Tout s&eacute;lectionner'}</span>
          </button>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-brand-500/10 border border-brand-500/25 animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckSquare className="w-4 h-4 text-brand-400" />
            <span className="text-sm text-white/70 font-sans">
              {selectedIds.size} s&eacute;lectionn&eacute;(e)s
            </span>
            <button
              onClick={() => {
                const ids = [...selectedIds]
                ids.forEach((id) => onToggleSelect(id))
              }}
              className="text-xs text-white/30 hover:text-white/60 font-sans transition-colors"
            >
              Effacer
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportSelected}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500/20 text-brand-300 text-xs font-medium font-sans hover:bg-brand-500/30 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
            <button
              onClick={() => {
                const selected = results.filter((p) => selectedIds.has(p.id))
                const allSaved = loadSavedProspects()
                selected.forEach((p) => {
                  if (!allSaved[p.id]) saveProspect(p)
                })
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 text-xs font-medium font-sans hover:bg-emerald-500/20 transition-colors border border-emerald-500/20"
            >
              <Share2 className="w-3.5 h-3.5" />
              Tout sauvegarder
            </button>
          </div>
        </div>
      )}

      {/* Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((prospect) => (
          <ProspectCard
            key={prospect.id}
            prospect={prospect}
            saved={savedProspects[prospect.id]}
            isSelected={selectedIds.has(prospect.id)}
            onToggleSelect={onToggleSelect}
            onSavedChange={onSavedChange}
          />
        ))}
      </div>

      {/* Filtered count */}
      {filterText && filtered.length !== results.length && (
        <p className="text-center text-sm text-white/30 font-sans">
          {filtered.length} sur {results.length} r&eacute;sultats correspondent &agrave; votre recherche
        </p>
      )}

      {/* Bottom export */}
      {results.length > 6 && selectedIds.size === 0 && (
        <div className="text-center pt-6">
          <button
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass-hover text-white/40 hover:text-white font-medium text-sm transition-all duration-300 font-sans"
            onClick={handleExport}
          >
            <Download className="w-4 h-4" />
            Exporter les {results.length} prospects en CSV
          </button>
        </div>
      )}
    </section>

      {/* Map overlay */}
      {showMap && (
        <MapPanel
          prospects={results.filter((p) => p.lat != null && p.lon != null)}
          onClose={() => setShowMap(false)}
        />
      )}
    </>
  )
})

export default ResultsSection
