import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

const PRIMARY = '#6366f1'
const PRIMARY_LIGHT = '#eef2ff'
const DARK = '#0f172a'
const GRAY = '#64748b'
const LIGHT_GRAY = '#f1f5f9'
const SUCCESS = '#34d399'
const WHITE = '#ffffff'

export function exportToPDF(prospects, { city, phoneOnly, totalFound } = {}, savedProspects = {}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 20
  const contentW = pageW - margin * 2

  // ---- Helper ----
  function addFooter(page) {
    const totalPages = doc.internal.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(GRAY)
      doc.setFont('helvetica', 'normal')
      doc.text(
        `ProspectRadar · Page ${i}/${totalPages} · Données OpenStreetMap`,
        margin,
        doc.internal.pageSize.getHeight() - 10
      )
      doc.line(
        margin,
        doc.internal.pageSize.getHeight() - 13,
        pageW - margin,
        doc.internal.pageSize.getHeight() - 13
      )
    }
  }

  const hasMeta = Object.keys(savedProspects).length > 0

  // ---- Brand header ----
  doc.setFillColor(15, 18, 39)
  doc.rect(0, 0, pageW, 38, 'F')

  doc.setFontSize(20)
  doc.setTextColor(WHITE)
  doc.setFont('helvetica', 'bold')
  doc.text('ProspectRadar', margin, 20)

  doc.setFontSize(10)
  doc.setTextColor(PRIMARY)
  doc.setFont('helvetica', 'normal')
  doc.text('Trouve tes clients avant tout le monde', margin, 30)

  // ---- Date & Info ----
  doc.setFontSize(9)
  doc.setTextColor(GRAY)
  doc.setFont('helvetica', 'normal')
  const dateStr = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  const timeStr = new Date().toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit',
  })
  doc.text(`Généré le ${dateStr} à ${timeStr}`, pageW - margin, 20, { align: 'right' })

  const phoneFilterText = phoneOnly ? ' · Avec téléphone uniquement' : ''
  doc.text(`${prospects.length} prospect${prospects.length > 1 ? 's' : ''} trouvé${prospects.length > 1 ? 's' : ''}${phoneFilterText}`, pageW - margin, 28, { align: 'right' })

  if (city) {
    doc.setFontSize(10)
    doc.setTextColor(WHITE)
    doc.setFont('helvetica', 'bold')
    doc.text(`Zone : ${city}`, pageW - margin, 36, { align: 'right' })
  }

  // ---- Stats row ----
  let y = 50
  const statCards = [
    { label: 'Prospects', value: prospects.length, color: PRIMARY },
    { label: 'Avec téléphone', value: prospects.filter((p) => p.phone).length, color: SUCCESS },
    { label: 'Sans téléphone', value: prospects.filter((p) => !p.phone).length, color: GRAY },
  ]

  const cardW = contentW / statCards.length - 3
  statCards.forEach((card, i) => {
    const cx = margin + i * (cardW + 4)
    doc.setFillColor(...hexToRgb(PRIMARY_LIGHT))
    doc.setDrawColor(...hexToRgb(PRIMARY))
    doc.setLineWidth(0.5)
    doc.roundedRect(cx, y, cardW, 22, 2, 2, 'FD')

    doc.setFontSize(9)
    doc.setTextColor(GRAY)
    doc.setFont('helvetica', 'normal')
    doc.text(card.label, cx + 4, y + 9)

    doc.setFontSize(16)
    doc.setTextColor(card.color)
    doc.setFont('helvetica', 'bold')
    doc.text(String(card.value), cx + 4, y + 19)
  })

  y += 36

  // ---- Divider ----
  doc.setDrawColor(...hexToRgb(LIGHT_GRAY))
  doc.line(margin, y, pageW - margin, y)
  y += 8

  // ---- Table ----
  const tableColumns = [
    { header: 'Nom', dataKey: 'name' },
    { header: 'Catégorie', dataKey: 'category' },
    { header: 'Adresse', dataKey: 'address' },
    { header: 'Téléphone', dataKey: 'phone' },
  ]

  if (hasMeta) {
    tableColumns.push({ header: 'Statut', dataKey: 'status' })
  }

  const tableRows = prospects.map((p) => {
    const saved = savedProspects[p.id]
    const row = {
      name: p.name || '',
      category: p.category || '',
      address: p.address ? (p.address.length > 35 ? p.address.slice(0, 33) + '…' : p.address) : '',
      phone: p.phone || '—',
    }
    if (hasMeta) {
      let status = '—'
      if (saved?.contacted) status = '✅ Contacté'
      else if (saved) status = '📌 Sauvegardé'
      row.status = status
    }
    return row
  })

  doc.autoTable({
    columns: tableColumns,
    body: tableRows,
    startY: y,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 8,
      font: 'helvetica',
      textColor: DARK,
      lineColor: LIGHT_GRAY,
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [99, 102, 241],
      textColor: WHITE,
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
      cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
    },
    bodyStyles: {
      cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      name: { cellWidth: 'auto' },
      category: { cellWidth: 30 },
      address: { cellWidth: 50 },
      phone: { cellWidth: 28 },
    },
    didParseCell(data) {
      if (data.section === 'body' && data.column.dataKey === 'status') {
        if (data.cell.raw === '✅ Contacté') {
          data.cell.styles.textColor = [52, 211, 153]
          data.cell.styles.fontStyle = 'bold'
        } else if (data.cell.raw && data.cell.raw.startsWith('📌')) {
          data.cell.styles.textColor = [99, 102, 241]
          data.cell.styles.fontStyle = 'bold'
        }
      }
    },
  })

  // ---- Summary after table ----
  const finalY = doc.lastAutoTable.finalY + 12
  const withPhone = prospects.filter((p) => p.phone).length
  const contacted = Object.values(savedProspects).filter((s) => s.contacted).length

  doc.setFontSize(9)
  doc.setTextColor(GRAY)
  doc.setFont('helvetica', 'normal')

  const summaryLines = [
    `Total : ${prospects.length} prospect${prospects.length > 1 ? 's' : ''}`,
    `Avec téléphone : ${withPhone}`,
    contacted > 0 ? `Contactés : ${contacted}` : null,
  ].filter(Boolean)

  summaryLines.forEach((line, i) => {
    doc.text(`· ${line}`, margin, finalY + i * 5)
  })

  // ---- Footer ----
  addFooter()

  // ---- Save ----
  const citySlug = (city || 'prospects').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'prospects'
  const date = new Date().toISOString().slice(0, 10)
  doc.save(`prospect-radar_${citySlug}_${prospects.length}_${date}.pdf`)
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [100, 100, 100]
}
