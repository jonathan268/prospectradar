function escapeCell(value) {
  const str = String(value ?? '')
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function exportToCSV(prospects, city = '') {
  const headers = ['Nom', 'Catégorie', 'Adresse', 'Téléphone', 'Horaires', 'Latitude', 'Longitude']

  const rows = prospects.map((p) => [
    p.name,
    p.category,
    p.address || '',
    p.phone || '',
    p.openingHours || '',
    p.lat ?? '',
    p.lon ?? '',
  ])

  const csvContent = [headers, ...rows]
    .map((row) => row.map(escapeCell).join(','))
    .join('\n')

  // BOM UTF-8 pour Excel
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  const citySlug = city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'prospects'
  const date = new Date().toISOString().slice(0, 10)
  link.download = `prospect-radar_${citySlug}_${date}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
