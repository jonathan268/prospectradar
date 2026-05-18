function escapeCell(value) {
  const str = String(value ?? '')
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function exportToCSV(prospects, city = '', savedProspects = {}) {
  const hasSaved = Object.keys(savedProspects).length > 0
  const hasMeta = prospects.some((p) => savedProspects[p.id])

  const headers = [
    'Nom', 'Catégorie', 'Adresse', 'Téléphone', 'Horaires',
    'Latitude', 'Longitude',
  ]

  if (hasMeta) {
    headers.push('Sauvegardé', 'Contacté', 'Date contact', 'Notes')
  }

  const rows = prospects.map((p) => {
    const saved = savedProspects[p.id]
    const row = [
      p.name,
      p.category,
      p.address || '',
      p.phone || '',
      p.openingHours || '',
      p.lat ?? '',
      p.lon ?? '',
    ]
    if (hasMeta) {
      row.push(
        saved ? 'Oui' : '',
        saved?.contacted ? 'Oui' : '',
        saved?.contactedAt ? new Date(saved.contactedAt).toLocaleDateString('fr-FR') : '',
        saved?.notes || '',
      )
    }
    return row
  })

  const csvContent = [headers, ...rows]
    .map((row) => row.map(escapeCell).join(','))
    .join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  const citySlug = city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'prospects'
  const date = new Date().toISOString().slice(0, 10)
  const count = prospects.length
  link.download = `prospect-radar_${citySlug}_${count}_${date}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
