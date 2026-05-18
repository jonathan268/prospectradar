const KEYS = {
  PROSPECTS: 'pr_saved_prospects',
  HISTORY: 'pr_search_history',
}

export function loadSavedProspects() {
  try {
    const raw = localStorage.getItem(KEYS.PROSPECTS)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveProspect(prospect, meta = {}) {
  const saved = loadSavedProspects()
  saved[prospect.id] = {
    ...prospect,
    savedAt: saved[prospect.id]?.savedAt || Date.now(),
    contacted: meta.contacted ?? saved[prospect.id]?.contacted ?? false,
    contactedAt: meta.contactedAt ?? saved[prospect.id]?.contactedAt ?? null,
    notes: meta.notes ?? saved[prospect.id]?.notes ?? '',
  }
  localStorage.setItem(KEYS.PROSPECTS, JSON.stringify(saved))
  return saved[prospect.id]
}

export function removeSavedProspect(id) {
  const saved = loadSavedProspects()
  delete saved[id]
  localStorage.setItem(KEYS.PROSPECTS, JSON.stringify(saved))
}

export function toggleContacted(id) {
  const saved = loadSavedProspects()
  if (!saved[id]) return
  saved[id].contacted = !saved[id].contacted
  saved[id].contactedAt = saved[id].contacted ? Date.now() : null
  localStorage.setItem(KEYS.PROSPECTS, JSON.stringify(saved))
  return saved[id]
}

export function updateNotes(id, notes) {
  const saved = loadSavedProspects()
  if (!saved[id]) return
  saved[id].notes = notes
  localStorage.setItem(KEYS.PROSPECTS, JSON.stringify(saved))
}

export function loadSearchHistory() {
  try {
    const raw = localStorage.getItem(KEYS.HISTORY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addSearchEntry(entry) {
  const history = loadSearchHistory()
  const filtered = history.filter(
    (h) => h.city !== entry.city || h.categoryId !== entry.categoryId || h.radius !== entry.radius
  )
  const next = [{ ...entry, searchedAt: Date.now() }, ...filtered].slice(0, 10)
  localStorage.setItem(KEYS.HISTORY, JSON.stringify(next))
  return next
}

export function clearSearchHistory() {
  localStorage.removeItem(KEYS.HISTORY)
}
