import { Download, Phone, Building2, Filter } from 'lucide-react'
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
    <div className="mt-8 space-y-5">
      {/* Stats + Export bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-base-200 rounded-xl px-4 py-2 border border-base-300">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-base-content">
              {results.length}
            </span>
            <span className="text-sm text-base-content/60 font-normal">
              {results.length === 1 ? 'entreprise' : 'entreprises'}
            </span>
          </div>

          {withPhone > 0 && (
            <div className="flex items-center gap-2 bg-base-200 rounded-xl px-4 py-2 border border-base-300">
              <Phone className="w-4 h-4 text-success" />
              <span className="text-sm font-semibold text-success">{withPhone}</span>
              <span className="text-sm text-base-content/60 font-normal">avec téléphone</span>
            </div>
          )}

          {phoneOnly && (
            <div className="badge badge-primary badge-outline gap-1 text-xs">
              <Filter className="w-3 h-3" />
              Avec téléphone uniquement
            </div>
          )}
        </div>

        <button
          className="btn btn-outline btn-sm gap-2 font-medium"
          onClick={handleExport}
        >
          <Download className="w-4 h-4" />
          Exporter CSV
        </button>
      </div>

      {/* Zone info */}
      <p className="text-xs text-base-content/40 font-light">
        Résultats pour <span className="font-medium text-base-content/60">{city}</span> ·
        Données OpenStreetMap · Toutes ces entreprises n'ont pas de site web référencé
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((prospect) => (
          <ProspectCard key={prospect.id} prospect={prospect} />
        ))}
      </div>

      {/* Footer export */}
      {results.length > 6 && (
        <div className="text-center pt-4">
          <button
            className="btn btn-outline btn-sm gap-2 font-medium"
            onClick={handleExport}
          >
            <Download className="w-4 h-4" />
            Exporter les {results.length} prospects en CSV
          </button>
        </div>
      )}
    </div>
  )
}
