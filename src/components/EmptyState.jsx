import { memo } from 'react'
import { SearchX, Globe, Map, Lightbulb } from 'lucide-react'

const EmptyState = memo(function EmptyState({ city }) {
  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-8 sm:p-10 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-5">
          <SearchX className="w-7 h-7 text-white/20" />
        </div>

        <h2 className="font-display font-semibold text-white text-lg mb-2">
          Aucun r&eacute;sultat trouv&eacute;
        </h2>
        <p className="text-white/40 text-sm font-sans max-w-sm mx-auto mb-7">
          Aucune entreprise sans site web n'a &eacute;t&eacute; trouv&eacute;e dans cette zone sur OpenStreetMap.
        </p>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/[0.06]" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 text-xs text-white/20 font-sans bg-surface-50">Que faire ?</span>
          </div>
        </div>

        <div className="space-y-3 text-left">
          {TIPS.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 px-3.5 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
              <tip.icon className="w-4 h-4 mt-0.5 shrink-0 text-brand-400" />
              <span className="text-sm text-white/50 font-sans leading-relaxed">{tip.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

export default EmptyState
