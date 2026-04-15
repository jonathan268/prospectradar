const NOMINATIM_URL = 'https://nominatim.openstreetmap.org'

export async function geocodeCity(cityName) {
  const url = `${NOMINATIM_URL}/search?q=${encodeURIComponent(cityName)}&format=json&limit=1&addressdetails=1`

  const response = await fetch(url, {
    headers: {
      'Accept-Language': 'fr',
      'User-Agent': 'ProspectRadar/1.0 (freelance-prospecting-tool)',
    },
  })

  if (!response.ok) throw new Error('Erreur Nominatim')

  const data = await response.json()
  if (!data.length) return null

  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
    displayName: data[0].address?.city || data[0].address?.town || data[0].address?.village || data[0].display_name.split(',')[0],
  }
}

export async function reverseGeocode(lat, lon) {
  const url = `${NOMINATIM_URL}/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`

  const response = await fetch(url, {
    headers: {
      'Accept-Language': 'fr',
      'User-Agent': 'ProspectRadar/1.0 (freelance-prospecting-tool)',
    },
  })

  if (!response.ok) throw new Error('Erreur Nominatim reverse')

  const data = await response.json()
  return {
    lat,
    lon,
    displayName:
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.county ||
      data.display_name.split(',')[0],
  }
}

export function getBrowserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Géolocalisation non supportée par ce navigateur'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(new Error('Impossible d\'obtenir ta position : ' + err.message))
    )
  })
}
