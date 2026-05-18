import { memo, useState } from 'react'
import {
  MapPin, Phone, PhoneOff, Tag, Clock, Copy, Check, Globe2,
  Bookmark, BookmarkCheck, PhoneCall, MessageSquare, X,
} from 'lucide-react'
import { saveProspect, removeSavedProspect, toggleContacted, updateNotes } from '../utils/storage'

const ProspectCard = memo(function ProspectCard({ prospect, saved, isSelected, onToggleSelect, onSavedChange }) {
  const [copied, setCopied] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [notesDraft, setNotesDraft] = useState(saved?.notes || '')
  const [localSaved, setLocalSaved] = useState(!!saved)
  const [localContacted, setLocalContacted] = useState(saved?.contacted || false)

  const isSaved = localSaved

  const handleCopyPhone = async () => {
    if (!prospect.phone) return
    try {
      await navigator.clipboard.writeText(prospect.phone)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
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

  const handleSave = () => {
    if (isSaved) {
      removeSavedProspect(prospect.id)
      setLocalSaved(false)
      setLocalContacted(false)
    } else {
      saveProspect(prospect)
      setLocalSaved(true)
    }
    onSavedChange?.()
  }

  const handleContacted = () => {
    const saved = saveProspect(prospect, { contacted: !localContacted })
    setLocalContacted(saved.contacted)
    onSavedChange?.()
  }

  const handleSaveNotes = () => {
    if (isSaved) {
      updateNotes(prospect.id, notesDraft)
    } else {
      const saved = saveProspect(prospect, { notes: notesDraft })
      setLocalSaved(true)
    }
    setShowNotes(false)
    onSavedChange?.()
  }

  const mapsUrl = prospect.lat && prospect.lon
    ? `https://www.openstreetmap.org/?mlat=${prospect.lat}&mlon=${prospect.lon}&zoom=17`
    : null

  return (
    <article className={`group relative rounded-xl border transition-all duration-300 ${
      isSelected
        ? 'bg-brand-500/10 border-brand-500/40'
        : localContacted
          ? 'bg-emerald-500/5 border-emerald-500/20'
          : 'bg-white/[0.03] border-white/[0.06] hover:border-brand-500/30 hover:bg-white/[0.05]'
    }`}>
      <div className="p-5 space-y-3.5">
        {/* Top row: badges + actions */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-medium font-sans whitespace-nowrap">
              <Globe2 className="w-3 h-3" />
              Sans site web
            </span>
            {prospect.category && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/40 text-[11px] font-sans truncate max-w-[140px]">
                <Tag className="w-3 h-3 shrink-0" />
                {prospect.category}
              </span>
            )}
            {localContacted && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300/80 text-[10px] font-sans font-medium">
                <PhoneCall className="w-2.5 h-2.5" />
                Contact&eacute;
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Checkbox */}
            <button
              onClick={() => onToggleSelect(prospect.id)}
              role="checkbox"
              aria-checked={isSelected}
              aria-label={`Sélectionner ${prospect.name}`}
              className={`w-7 h-7 rounded-md flex items-center justify-center transition-all duration-200 ${
                isSelected
                  ? 'bg-brand-500 text-white'
                  : 'bg-white/[0.04] border border-white/[0.08] text-white/20 hover:text-white/50'
              }`}
            >
              <div className={`w-3.5 h-3.5 rounded-sm ${isSelected ? 'bg-brand-500' : 'bg-transparent border border-white/30'}`}>
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
              </div>
            </button>

            {/* Save button */}
            <button
              onClick={handleSave}
              aria-label={isSaved ? 'Retirer des favoris' : 'Sauvegarder'}
              className={`w-7 h-7 rounded-md flex items-center justify-center transition-all duration-200 ${
                isSaved
                  ? 'text-brand-400 hover:text-brand-300'
                  : 'text-white/20 hover:text-white/50'
              }`}
              title={isSaved ? 'Retirer des favoris' : 'Sauvegarder'}
            >
              {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Name */}
        <h3 className="font-display font-semibold text-white text-base leading-snug group-hover:text-brand-300 transition-colors duration-200">
          {prospect.name}
        </h3>

        {/* Address */}
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-white/20" />
          {prospect.address ? (
            mapsUrl ? (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/40 hover:text-brand-300 hover:underline transition-colors line-clamp-2 font-sans"
              >
                {prospect.address}
              </a>
            ) : (
              <span className="text-sm text-white/40 line-clamp-2 font-sans">{prospect.address}</span>
            )
          ) : (
            <span className="text-sm text-white/20 italic font-sans">Adresse non renseign&eacute;e</span>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-white/[0.06] via-white/[0.03] to-transparent" />

        {/* Phone + Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {prospect.phone ? (
              <>
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-sm text-white font-medium tracking-wide font-sans truncate">
                  {prospect.phone}
                </span>
              </>
            ) : (
              <>
                <PhoneOff className="w-4 h-4 text-white/20 shrink-0" />
                <span className="text-xs text-white/30 italic font-sans">
                  T&eacute;l&eacute;phone non renseign&eacute;
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            {prospect.phone && (
              <button
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
                onClick={handleCopyPhone}
                title="Copier le numéro"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            )}
            {isSaved && (
              <button
                onClick={() => { setShowNotes(!showNotes); if (!showNotes) setNotesDraft(saved?.notes || '') }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  showNotes ? 'text-brand-400 bg-brand-500/10' : 'text-white/30 hover:text-white hover:bg-white/[0.06]'
                }`}
                title="Notes"
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </button>
            )}
            {isSaved && (
              <button
                onClick={handleContacted}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  localContacted ? 'text-emerald-400 bg-emerald-500/10' : 'text-white/30 hover:text-white hover:bg-white/[0.06]'
                }`}
                title={localContacted ? 'Marquer comme non contacté' : 'Marquer comme contacté'}
              >
                <PhoneCall className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Opening hours */}
        {prospect.openingHours && !showNotes && (
          <div className="flex items-start gap-2 pt-1">
            <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0 text-white/20" />
            <span className="text-xs text-white/30 line-clamp-1 font-sans">{prospect.openingHours}</span>
          </div>
        )}

        {/* Notes inline editor */}
        {showNotes && (
          <div className="pt-1 space-y-2">
            <div className="h-px bg-gradient-to-r from-white/[0.06] via-white/[0.03] to-transparent" />
            <textarea
              className="w-full min-h-[60px] rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-xs font-sans p-2.5 outline-none focus:border-brand-500/40 resize-none transition-all duration-200 placeholder-white/20"
              placeholder="Ajoute une note priv&eacute;e..."
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowNotes(false)}
                className="text-[11px] text-white/30 hover:text-white/60 font-sans transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-3 py-1 rounded-lg bg-brand-500/20 text-brand-300 text-[11px] font-medium font-sans hover:bg-brand-500/30 transition-colors"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  )
})

export default ProspectCard
