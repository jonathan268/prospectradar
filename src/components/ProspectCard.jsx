import { useState } from 'react'
import { MapPin, Phone, PhoneOff, Tag, Clock, Copy, Check, Globe2 } from 'lucide-react'

export default function ProspectCard({ prospect }) {
  const [copied, setCopied] = useState(false)

  const handleCopyPhone = async () => {
    if (!prospect.phone) return
    try {
      await navigator.clipboard.writeText(prospect.phone)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const el = document.createElement('textarea')
      el.value = prospect.phone
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const mapsUrl = prospect.lat && prospect.lon
    ? `https://www.openstreetmap.org/?mlat=${prospect.lat}&mlon=${prospect.lon}&zoom=17`
    : null

  return (
    <div className="card bg-base-200 border border-base-300 hover:border-primary/40 hover:shadow-lg transition-all duration-200 group">
      <div className="card-body p-4 gap-3">
        {/* Badges top */}
        <div className="flex flex-wrap gap-2">
          <div className="badge badge-success badge-sm gap-1 font-medium">
            <Globe2 className="w-3 h-3" />
            Sans site web
          </div>
          <div className="badge badge-ghost badge-sm font-normal">
            <Tag className="w-3 h-3 mr-1" />
            {prospect.category}
          </div>
        </div>

        {/* Nom */}
        <h3 className="font-semibold text-base-content text-base leading-snug group-hover:text-primary transition-colors">
          {prospect.name}
        </h3>

        {/* Adresse */}
        <div className="flex items-start gap-2 text-sm text-base-content/60">
          <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-base-content/40" />
          {prospect.address ? (
            mapsUrl ? (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary hover:underline transition-colors line-clamp-2"
              >
                {prospect.address}
              </a>
            ) : (
              <span className="line-clamp-2">{prospect.address}</span>
            )
          ) : (
            <span className="italic text-base-content/40">Adresse non renseignée</span>
          )}
        </div>

        {/* Téléphone */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            {prospect.phone ? (
              <>
                <Phone className="w-4 h-4 shrink-0 text-success" />
                <span className="text-base-content font-medium tracking-wide">
                  {prospect.phone}
                </span>
              </>
            ) : (
              <>
                <PhoneOff className="w-4 h-4 shrink-0 text-base-content/30" />
                <span className="text-base-content/40 italic text-xs">
                  Téléphone non renseigné
                </span>
              </>
            )}
          </div>

          {prospect.phone && (
            <button
              className="btn btn-ghost btn-xs gap-1 text-base-content/50 hover:text-primary"
              onClick={handleCopyPhone}
              title="Copier le numéro"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-success" />
                  <span className="text-success text-xs">Copié</span>
                </>
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>

        {/* Horaires (si disponible) */}
        {prospect.openingHours && (
          <div className="flex items-start gap-2 text-xs text-base-content/50 border-t border-base-300 pt-2 mt-1">
            <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span className="line-clamp-1">{prospect.openingHours}</span>
          </div>
        )}
      </div>
    </div>
  )
}
