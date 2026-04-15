export const CATEGORIES = [
  {
    id: 'all',
    label: 'Tous les commerces',
    icon: 'Store',
  },
  {
    id: 'restaurant',
    label: 'Restaurants & Cafés',
    icon: 'UtensilsCrossed',
    key: 'amenity',
    value: 'restaurant|cafe|bar|fast_food|pub|juice_bar|ice_cream',
  },
  {
    id: 'beauty',
    label: 'Salons & Beauté',
    icon: 'Scissors',
    key: 'shop',
    value: 'hairdresser|beauty|massage|cosmetics|nail_salon',
  },
  {
    id: 'clothes',
    label: 'Boutiques & Mode',
    icon: 'ShoppingBag',
    key: 'shop',
    value: 'clothes|shoes|jewelry|fashion|accessories|bags',
  },
  {
    id: 'health',
    label: 'Santé & Médical',
    icon: 'Heart',
    key: 'amenity',
    value: 'pharmacy|doctors|dentist|clinic|hospital',
  },
  {
    id: 'hotel',
    label: 'Hôtels & Hébergement',
    icon: 'BedDouble',
    key: 'tourism',
    value: 'hotel|guest_house|hostel|motel',
  },
  {
    id: 'food',
    label: 'Alimentation',
    icon: 'ShoppingCart',
    key: 'shop',
    value: 'supermarket|grocery|bakery|butcher|greengrocer|convenience|deli',
  },
  {
    id: 'auto',
    label: 'Auto & Garage',
    icon: 'Car',
    key: 'shop',
    value: 'car_repair|tyres|car_parts|car',
  },
  {
    id: 'finance',
    label: 'Banques & Finance',
    icon: 'Landmark',
    key: 'amenity',
    value: 'bank|bureau_de_change|money_transfer|microfinance',
  },
  {
    id: 'education',
    label: 'Éducation & Formation',
    icon: 'GraduationCap',
    key: 'amenity',
    value: 'school|college|university|language_school|driving_school',
  },
  {
    id: 'sport',
    label: 'Sport & Loisirs',
    icon: 'Dumbbell',
    key: 'leisure',
    value: 'fitness_centre|sports_centre|gym',
  },
]

export const OSM_LABELS = {
  // Restauration
  restaurant: 'Restaurant',
  cafe: 'Café',
  bar: 'Bar',
  fast_food: 'Fast Food',
  pub: 'Pub',
  juice_bar: 'Bar à Jus',
  ice_cream: 'Glacier',
  // Beauté
  hairdresser: 'Salon de Coiffure',
  beauty: 'Institut de Beauté',
  massage: 'Spa / Massage',
  cosmetics: 'Cosmétiques',
  nail_salon: 'Nail Art',
  // Mode
  clothes: 'Boutique Vêtements',
  shoes: 'Chaussures',
  jewelry: 'Bijouterie',
  fashion: 'Mode',
  accessories: 'Accessoires',
  // Santé
  pharmacy: 'Pharmacie',
  doctors: 'Cabinet Médical',
  dentist: 'Dentiste',
  hospital: 'Hôpital',
  clinic: 'Clinique',
  // Hébergement
  hotel: 'Hôtel',
  guest_house: "Maison d'hôte",
  hostel: 'Auberge',
  motel: 'Motel',
  // Alimentation
  supermarket: 'Supermarché',
  grocery: 'Épicerie',
  bakery: 'Boulangerie',
  butcher: 'Boucherie',
  greengrocer: 'Primeur',
  convenience: 'Supérette',
  deli: 'Traiteur',
  // Auto
  car_repair: 'Garage',
  tyres: 'Pneus',
  car_parts: 'Pièces Auto',
  car: 'Concessionnaire',
  // Finance
  bank: 'Banque',
  bureau_de_change: 'Bureau de Change',
  money_transfer: 'Transfert Argent',
  microfinance: 'Microfinance',
  // Éducation
  school: 'École',
  college: 'Collège',
  university: 'Université',
  language_school: 'École de Langues',
  driving_school: 'Auto-École',
  // Sport
  fitness_centre: 'Salle de Sport',
  sports_centre: 'Centre Sportif',
  gym: 'Gym',
}

export function getOsmLabel(tags) {
  const tagTypes = ['amenity', 'shop', 'tourism', 'craft', 'office', 'leisure']
  for (const type of tagTypes) {
    if (tags[type]) {
      return OSM_LABELS[tags[type]] || capitalize(tags[type].replace(/_/g, ' '))
    }
  }
  return 'Commerce'
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
