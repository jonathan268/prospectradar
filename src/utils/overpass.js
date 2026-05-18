import { CATEGORIES, getOsmLabel } from './categories'

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'
const queryCache = new Map()

function buildOverpassQuery(lat, lon, radiusM, categoryIds) {
  const around = `(around:${radiusM},${lat},${lon})`

  const ids = Array.isArray(categoryIds) ? categoryIds : [categoryIds || 'all']

  if (ids.includes('all')) {
    const allFilters = [
      `["name"]["shop"]`,
      `["name"]["amenity"~"^(restaurant|cafe|bar|fast_food|pub|pharmacy|doctors|dentist|clinic|bank|bureau_de_change|driving_school|language_school)$"]`,
      `["name"]["tourism"~"^(hotel|guest_house|hostel|motel)$"]`,
      `["name"]["craft"]`,
      `["name"]["leisure"~"^(fitness_centre|sports_centre|gym)$"]`,
    ]
    const filterLines = allFilters.flatMap((f) => [
      `  node${f}${around};`,
      `  way${f}${around};`,
    ])
    return `[out:json][timeout:60];
(
${filterLines.join('\n')}
);
out center;`
  }

  const filterLines = ids.flatMap((id) => {
    const cat = CATEGORIES.find((c) => c.id === id)
    if (!cat) return []
    const filter = `["name"]["${cat.key}"~"^(${cat.value})$"]`
    return [
      `  node${filter}${around};`,
      `  way${filter}${around};`,
    ]
  })

  if (filterLines.length === 0) return null

  return `[out:json][timeout:60];
(
${filterLines.join('\n')}
);
out center;`
}

function buildProspectId(el) {
  const tags = el.tags || {}
  const osmType = el.type || 'node'
  const name = (tags.name || '').trim().toLowerCase()
  return `${osmType}/${el.id}`
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

export async function fetchProspects(lat, lon, radiusM, categoryIds) {
  const cacheKey = `${lat}|${lon}|${radiusM}|${(Array.isArray(categoryIds) ? categoryIds : [categoryIds || 'all']).join(',')}`
  const cached = queryCache.get(cacheKey)
  if (cached) return cached

  const query = buildOverpassQuery(lat, lon, radiusM, categoryIds)
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
        id: buildProspectId(el),
        osmId: el.id,
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
    .reduce((acc, cur) => {
      const key = `${cur.name.toLowerCase().trim()}|${(cur.address || '').toLowerCase().trim().slice(0, 20)}`
      if (!acc.map.has(key)) {
        acc.map.set(key, true)
        acc.list.push(cur)
      }
      return acc
    }, { map: new Map(), list: [] })
    .list

  queryCache.set(cacheKey, prospects)
  return prospects
}

export function clearQueryCache() {
  queryCache.clear()
}
