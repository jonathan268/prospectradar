import { SearchX, Globe, Map } from 'lucide-react'

export default function EmptyState({ city }) {
  return (
    <div className="card bg-base-200 border border-base-300">
      <div className="card-body items-center text-center py-16">
        <div className="bg-base-300 rounded-full p-5 mb-4">
          <SearchX className="w-10 h-10 text-base-content/30" />
        </div>
        <h3 className="text-lg font-semibold text-base-content">
          Aucun résultat trouvé
        </h3>
        <p className="text-base-content/50 text-sm max-w-sm font-normal mt-1">
          Aucune entreprise sans site web n'a été trouvée dans cette zone sur OpenStreetMap.
        </p>

        <div className="divider text-xs text-base-content/30 my-4">Que faire ?</div>

        <ul className="space-y-3 text-sm text-base-content/60 text-left w-full max-w-sm">
          <li className="flex items-start gap-3">
            <Map className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
            <span>Augmente le rayon de recherche (essaie 10 km ou 20 km)</span>
          </li>
          <li className="flex items-start gap-3">
            <SearchX className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
            <span>Sélectionne "Tous les commerces" pour une recherche plus large</span>
          </li>
          <li className="flex items-start gap-3">
            <Globe className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
            <span>
              OpenStreetMap peut avoir une couverture limitée dans certaines zones — essaie une
              ville voisine plus grande
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}
