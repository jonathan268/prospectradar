import { CATEGORIES, getOsmLabel } from './categories'

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

function buildOverpassQuery(lat, lon, radiusM, categoryId) {
  const around = `(around:${radiusM},${lat},${lon})`

  let filterLines = []

  if (categoryId === 'all') {
    // Union de toutes les catégories commerciales courantes
    const allFilters = [
      `["name"]["shop"]`,
      `["name"]["amenity"~"^(restaurant|cafe|bar|fast_food|pub|pharmacy|doctors|dentist|clinic|bank|bureau_de_change|driving_school|language_school)$"]`,
      `["name"]["tourism"~"^(hotel|guest_house|hostel|motel)$"]`,
      `["name"]["craft"]`,
      `["name"]["leisure"~"^(fitness_centre|sports_centre|gym)$"]`,
    ]
    for (const f of allFilters) {
      filterLines.push(`  node${f}${around};`)
      filterLines.push(`  way${f}${around};`)
    }
  } else {
    const cat = CATEGORIES.find((c) => c.id === categoryId)
    if (!cat) return null

    const filter = `["name"]["${cat.key}"~"^(${cat.value})$"]`
    filterLines.push(`  node${filter}${around};`)
    filterLines.push(`  way${filter}${around};`)
  }

  return `[out:json][timeout:60];
(
${filterLines.join('\n')}
);
out center;`
}

function buildAddress(tags) {
  if (tags['addr:full']) return tags['addr:full']
  const parts = []
  if (tags['addr:housenumber']) parts.push(tags['addr:housenumber'])
  if (tags['addr:street']) parts.push(tags['addr:street'])
  if (tags['addr:quarter']) parts.push(tags['addr:quarter'])
  if (tags['addr:suburb']) parts.push(tags['addr:suburb'])
  if (tags['addr:city']) parts.push(tags['addr:city'])
  return parts.join(', ') || tags.address || ''
}

function extractPhone(tags) {
  return (
    tags.phone ||
    tags['contact:phone'] ||
    tags['contact:mobile'] ||
    tags.mobile ||
    tags['phone:FR'] ||
    null
  )
}

export async function fetchProspects(lat, lon, radiusM, categoryId) {
  const query = buildOverpassQuery(lat, lon, radiusM, categoryId)
  if (!query) throw new Error('Catégorie invalide')

  const response = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: query,
  })

  if (!response.ok) {
    throw new Error(`Overpass API a répondu avec le code ${response.status}`)
  }

  const data = await response.json()

  const prospects = data.elements
    .filter((el) => {
      const tags = el.tags || {}
      return (
        tags.name &&
        !tags.website &&
        !tags['contact:website'] &&
        !tags['url']
      )
    })
    .map((el) => {
      const tags = el.tags || {}
      return {
        id: el.id,
        name: tags.name,
        phone: extractPhone(tags),
        address: buildAddress(tags),
        category: getOsmLabel(tags),
        openingHours: tags.opening_hours || null,
        lat: el.lat ?? el.center?.lat ?? null,
        lon: el.lon ?? el.center?.lon ?? null,
      }
    })
    .filter((p) => p.name)
    // Dédoublonnage par nom + adresse approximative
    .reduce((acc, cur) => {
      const key = `${cur.name.toLowerCase().trim()}`
      if (!acc.map.has(key)) {
        acc.map.set(key, true)
        acc.list.push(cur)
      }
      return acc
    }, { map: new Map(), list: [] })
    .list

  return prospects
}
