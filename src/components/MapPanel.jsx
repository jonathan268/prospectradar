import { useEffect, useRef } from 'react'
import { MapPin, Phone, X } from 'lucide-react'

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com">CARTO</a>'

export default function MapPanel({ prospects, onClose }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)

  const validProspects = prospects.filter((p) => p.lat != null && p.lon != null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const initMap = async () => {
      const L = await import('leaflet')
      await import('leaflet/dist/leaflet.css')

      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: false,
        fadeAnimation: true,
        zoomAnimation: true,
      })

      L.tileLayer(TILE_URL, {
        attribution: TILE_ATTR,
        maxZoom: 19,
      }).addTo(map)

      L.control.zoom({
        position: 'bottomright',
      }).addTo(map)

      L.control.attribution({
        position: 'bottomleft',
        prefix: false,
      }).addTo(map)

      // Calculate bounds from markers
      const markers = []
      const bounds = []

      validProspects.forEach((p) => {
        const lat = parseFloat(p.lat)
        const lon = parseFloat(p.lon)
        if (isNaN(lat) || isNaN(lon)) return

        const icon = L.divIcon({
          className: '',
          html: `<div style="
            width: 36px; height: 36px;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            border: 2px solid rgba(255,255,255,0.8);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(99,102,241,0.4);
            cursor: pointer;
            transition: transform 0.2s;
          ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          popupAnchor: [0, -22],
        })

        const marker = L.marker([lat, lon], { icon })
        const phoneHtml = p.phone
          ? `<div style="display:flex;align-items:center;gap:6px;margin-top:4px">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <a href="tel:${p.phone}" style="color:#94a3b8;text-decoration:none;font-size:13px">${p.phone}</a>
            </div>`
          : ''

        marker.bindPopup(`
          <div style="font-family:system-ui,-apple-system,sans-serif;min-width:200px">
            <h3 style="margin:0 0 4px;font-size:15px;font-weight:600;color:#0f172a">${escapeHtml(p.name)}</h3>
            ${p.category ? `<span style="display:inline-block;padding:1px 8px;border-radius:99px;background:#eef2ff;color:#6366f1;font-size:11px;font-weight:500;margin-bottom:6px">${escapeHtml(p.category)}</span>` : ''}
            ${p.address ? `<div style="display:flex;align-items:start;gap:4px;margin-top:4px;color:#64748b;font-size:12px">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" style="margin-top:1px;flex-shrink:0"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>${escapeHtml(p.address)}</span>
            </div>` : ''}
            ${phoneHtml}
            <div style="margin-top:8px;padding-top:6px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8">
              Sans site web référencé
            </div>
          </div>
        `, {
          className: 'custom-popup',
          maxWidth: 280,
        })

        marker.addTo(map)
        markers.push(marker)
        bounds.push([lat, lon])
      })

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
      } else {
        map.setView([20, 0], 2)
      }

      mapRef.current = map
    }

    initMap()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [validProspects])

  return (
    <div className="fixed inset-0 z-[100] flex flex-col animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm" onClick={onClose} />

      {/* Map container */}
      <div className="relative flex-1 m-3 sm:m-4 rounded-2xl overflow-hidden border border-white/[0.06] shadow-2xl">
        <div ref={containerRef} className="w-full h-full" />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-[1000] flex items-center justify-between p-3 pointer-events-none">
          <div className="pointer-events-auto glass rounded-xl px-4 py-2.5 flex items-center gap-3">
            <MapPin className="w-4 h-4 text-brand-400" />
            <span className="text-sm text-white font-medium font-sans">
              {validProspects.length} prospect{validProspects.length > 1 ? 's' : ''} sur la carte
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer la carte"
            className="pointer-events-auto w-9 h-9 rounded-xl glass flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.08] transition-all duration-200"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-3 left-3 right-3 z-[1000] pointer-events-none">
          <div className="pointer-events-auto glass rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-white/40 font-sans">
              Cliquez sur un marqueur pour voir les d&eacute;tails
            </span>
            <span className="text-xs text-white/30 font-sans">
              &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white/60 transition-colors">OpenStreetMap</a> &middot; <a href="https://carto.com" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white/60 transition-colors">CARTO</a>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}
