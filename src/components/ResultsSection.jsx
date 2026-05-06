import { Download, Phone, Building2, Filter, TrendingUp } from 'lucide-react'
import ProspectCard from './ProspectCard'
import EmptyState from './EmptyState'
import { exportToCSV } from '../utils/exportCsv'

export default function ResultsSection({ results, searchParams }) {
  const { city, totalFound, phoneOnly } = searchParams
  const withPhone = results.filter((p) => p.phone).length

  const handleExport = () => {
    exportToCSV(results, city)
  }

  if (results.length === 0) {
    return (
      <div className="mt-8">
        <EmptyState city={city} />
      </div>
    )
  }

  return (
    <div className="mt-10 space-y-6">
      {/* Stats + Export bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl px-5 py-3 border border-primary/20">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-lg font-bold text-base-content">
                {results.length}
              </span>
              <span className="text-sm text-base-content/60 font-normal ml-1">
                {results.length === 1 ? 'entreprise' : 'entreprises'}
              </span>
            </div>
          </div>

          {withPhone > 0 && (
            <div className="flex items-center gap-2 bg-success/10 rounded-2xl px-4 py-3 border border-success/20">
              <Phone className="w-4 h-4 text-success" />
              <span className="text-sm font-bold text-success">{withPhone}</span>
              <span className="text-sm text-base-content/60 font-normal">avec téléphone</span>
            </div>
          )}

          {phoneOnly && (
            <div className="badge badge-primary badge-lg gap-1 text-sm font-medium px-4 py-3">
              <Filter className="w-4 h-4" />
              Avec téléphone uniquement
            </div>
          )}
        </div>

        <button
          className="btn btn-primary btn-sm gap-2 font-semibold"
          onClick={handleExport}
        >
          <Download className="w-4 h-4" />
          Exporter CSV
        </button>
      </div>

      {/* Zone info */}
      <div className="flex items-center gap-2 text-sm text-base-content/50 bg-base-200/50 rounded-xl px-4 py-3 border border-base-300/50">
        <TrendingUp className="w-4 h-4 text-primary" />
        <span>
          Résultats pour <span className="font-semibold text-base-content">{city}</span> · 
          Données OpenStreetMap · Toutes ces entreprises n'ont pas de site web référencé
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((prospect) => (
          <ProspectCard key={prospect.id} prospect={prospect} />
        ))}
      </div>

      {/* Footer export */}
      {results.length > 6 && (
        <div className="text-center pt-6">
          <button
            className="btn btn-outline btn-lg gap-2 font-medium"
            onClick={handleExport}
          >
            <Download className="w-5 h-5" />
            Exporter les {results.length} prospects en CSV
          </button>
        </div>
      )}
    </div>
  )
}