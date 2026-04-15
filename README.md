# ProspectRadar

**Trouve les entreprises sans site web. Contacte-les avant tout le monde.**

Outil gratuit pour les freelances web qui veulent identifier des prospects qualifiés via OpenStreetMap.

---

## Stack

- React 19 + Vite 6
- TailwindCSS + DaisyUI 4 (thème Forest)
- Lucide React (icônes)
- Overpass API (OpenStreetMap) — 100% gratuit, sans clé
- Nominatim (géocodage) — 100% gratuit, sans clé

## Installation

```bash
npm install
npm run dev
```

## Build & Déploiement Vercel

```bash
npm run build
```

Déploie le dossier `dist/` sur Vercel en un clic.

## Fonctionnalités

- Recherche par ville ou position GPS
- 11 catégories de commerces (restaurants, salons, boutiques, santé, hôtels...)
- Rayon de 1 à 50 km
- Filtre "avec téléphone uniquement"
- Export CSV (avec BOM UTF-8 pour Excel)
- Copie du numéro en un clic
- Lien OpenStreetMap par établissement
- Skeleton loading + gestion des erreurs

## Limites

Les données OpenStreetMap peuvent être incomplètes dans certaines zones, notamment en Afrique subsaharienne.
La couverture s'améliore chaque année grâce à la communauté.

## Évolutions possibles (vers un SaaS)

- Auth + système de crédits (NotchPay)
- Sauvegarde de listes de prospects
- Historique de recherches
- Enrichissement des données (scraping pages jaunes locales)
- Intégration CRM basique
