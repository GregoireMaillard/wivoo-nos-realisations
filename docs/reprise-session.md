# Reprise de session — Prototype Wivoo "Nos Réalisations"

## État du projet au 03/06/2026

### Migration V2 → V3
Le projet a migré de HTML statique vers **Astro 6.4.1** + **Tailwind CSS v4** + adaptateur **@astrojs/vercel**.
Un back-office d'administration a été ajouté.

### Back-office — persistance (ajout 03/06/2026)
Le back-office persiste désormais en production : `writeCases()` (`src/lib/cases.ts`)
commit `cases.json` sur GitHub via l'API Contents quand `GITHUB_TOKEN` est présent
(prod Vercel), sinon `writeFileSync` en local. Le commit déclenche le rebuild Vercel
(~1 min). Retry sur conflit SHA (`ConcurrentEditError`). **Pas encore d'authentification
sur `/admin`** — voir `docs/back-office.md` (env vars, token, TODO sécurité).

---

### Ce qui est terminé
- `src/pages/index.astro` — page principale avec filtres double rangée sticky, toggle grille/liste, hero violet, fond gris
- `src/pages/case-studies/[slug].astro` — pages détail avec bouton retour, breadcrumb, KPIs bordés, défi, solution, CTA
- `src/pages/admin/index.astro` — liste des études de cas (back-office)
- `src/pages/admin/new.astro` — formulaire de création d'une nouvelle étude de cas
- `src/pages/admin/edit/[slug].astro` — formulaire d'édition d'une étude de cas
- `src/components/Navbar.astro` — navbar sticky z-50 avec dropdowns au hover (liens wivoo.fr réels)
- `src/components/Footer.astro`
- `src/layouts/BaseLayout.astro` — favicon Wivoo, fond gris global
- `src/data/cases.json` — source de données des 8 études de cas
- `src/lib/cases.ts` — helpers TypeScript pour accéder aux données
- `src/styles/global.css`
- `CLAUDE.md` — règles, contexte projet et persona UX expert (à jour)
- `docs/plan.md` — plan d'implémentation

### Structure des fichiers
```
PrototypeChallengeShowcase_V3/
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── CLAUDE.md
├── public/
│   ├── favicon.ico
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Footer.astro
│   │   └── Navbar.astro
│   ├── data/
│   │   └── cases.json          ← source de vérité des 8 études de cas
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── lib/
│   │   └── cases.ts
│   ├── pages/
│   │   ├── index.astro
│   │   ├── case-studies/
│   │   │   └── [slug].astro
│   │   └── admin/
│   │       ├── index.astro
│   │       ├── new.astro
│   │       └── edit/
│   │           └── [slug].astro
│   └── styles/
│       └── global.css
└── docs/
    ├── plan.md
    └── reprise-session.md (ce fichier)
```

### Les 8 études de cas
| Slug | Secteur | Industrie |
|------|---------|-----------|
| `optimisation-scores-predictifs` | Data | Retail |
| `service-client-btp` | Product | BTP |
| `ecommerce-pharma` | Product | Santé *(affiché "Santé", stocké "Pharma / Santé")* |
| `chatbot-genai-banque` | AI | Banque *(affiché "Banque", stocké "Banques & Assurances")* |
| `engagement-retail-sportif` | Design | Retail |
| `experience-beaute-cosmetiques` | Design | Cosmétique |
| `abonnements-media-francais` | Data | Médias |
| `gestion-donnees-retail` | Data | Retail |

---

### Git — état local
- Branche : `main`
- 21 commits effectués, tout est commité et pushé
- Remote GitHub (SSH) : `git@github.com:GregoireMaillard/wivoo-nos-realisations.git`

### Déploiement
- **Vercel** : https://wivoo-nos-realisations.vercel.app/ — **en ligne et à jour**
- Déploiement automatique à chaque push sur `main` via l'intégration GitHub

---

## Améliorations réalisées lors de la session du 03/06/2026

| Commit | Description |
|--------|-------------|
| `22afa6f` | Navbar avec dropdowns au hover et liens wivoo.fr réels |
| `d6bb313` | Description des cards toujours visible (suppression du hover-only) |
| `05b6910` | Fix filtres par secteur (bug ES module scope) |
| `2ff3710` | Favicon Wivoo officiel dans l'onglet navigateur |
| `db76cc5` | cursor-pointer sur tous les éléments interactifs |
| `8b1b444` | Fond violet clair `#f0eeff` sur le hero et les filtres |
| `d32b4e1` | Grille 3 colonnes + espacement hero/cards amélioré |
| `3aa3e19` | Refonte cards : design split image/contenu + KPI + badges industrie |
| `0ea69d0` | Fond gris clair global pour contraster avec les cards blanches |
| `e346489` | Pages détail : bouton "← Retour" + bordure colorée sur les cards KPI |
| `4c49a42` | Toggle grille/liste centré dans la barre des filtres + suppression label "Portfolio" |
| `0c8880c` | Filtres double rangée Expertise/Secteur + corrections audit UX + vue liste améliorée |
| `46398bc` | Filtres sortis du hero banner + sticky sous la navbar |

---

## Architecture des filtres (état actuel)

### Barre de filtres — `index.astro`
- **Position** : fond blanc, sticky `top-24 z-40`, ombre basse — se colle sous la navbar au scroll
- **Ligne 1 — Expertise** : `Tous · 4` + `Product · 2` / `AI · 1` / `Data · 3` / `Design · 2`
  - Boutons avec bordure colorée (couleur secteur) — inactif = outline coloré, actif = fond plein
- **Ligne 2 — Secteur** : `Tous · 6` + `BTP · 1` / `Banque · 1` / `Cosmétique · 1` / `Médias · 1` / `Santé · 1` / `Retail · 3`
  - Boutons gris outline, actif = fond gris foncé
- **Droite** : compteur `N résultats` (gris) + toggle grille/liste
- **Logique** : AND entre les deux groupes — état vide avec bouton reset
- **Labels raccourcis** : `industryLabels` map dans le frontmatter (`'Banques & Assurances' → 'Banque'`, `'Pharma / Santé' → 'Santé'`) appliqué aux filtres ET aux badges cards

### Cards — vue grille
- Ratio image : `2/1` (réduction vs 16/9 précédent)
- Titre : `text-base font-bold` (16px)
- KPI : valeur `text-2xl` + label `text-sm` dans un wrapper `.kpi-group`
- CTA "Voir le cas →" : coloré avec la couleur du secteur

### Cards — vue liste
- Colonnes : `220px | 1fr (titre 3 lignes max) | 180px (KPI value + label) | auto (CTA)`
- Image : `aspect-ratio: 16/9`, largeur 220px
- KPI : valeur + label empilés dans `.kpi-group` (flex column)

---

## Ce qu'il reste à faire / pistes d'amélioration

- Animations d'entrée des cards au scroll (Intersection Observer)
- Témoignages clients sur les pages détail
- Navigation entre cas (précédent / suivant) sur les pages détail
- Mode sombre
- SEO : og:image et meta description par cas
- **Back-office : authentification** (actuellement `/admin` est OUVERT — à sécuriser avant toute exposition réelle, cf. `docs/back-office.md`)
- Back-office phase 2 : encart d'aide permanent dans l'admin (reporté à la demande)
- Hero : ajouter une accroche différenciante (preuve sociale, chiffre agrégé)
- Point 5 audit UX non traité : supprimer le `<hr>` dans les cards (bruit visuel)

---

## Couleurs secteurs (référence)
| Secteur | Couleur | Hex |
|---------|---------|-----|
| Product | Violet | `#6d28d9` |
| AI | Bleu cyan | `#0891b2` |
| Data | Vert émeraude | `#059669` |
| Design | Rose | `#db2777` |

## Autres couleurs
- Hero : `#f0eeff` (violet très clair)
- Fond page : `#f9fafb` (gray-50)
- Barre filtres : `#ffffff` + ombre `rgba(0,0,0,.06)`
- Footer fond : `#160b52`
- Footer bannière réseaux : `#3a26b0`
- CTA vert : `#5BDF6A`

## Stack technique
- Framework : Astro 6.4.1
- CSS : Tailwind CSS v4 (via `@tailwindcss/vite`)
- Adaptateur : `@astrojs/vercel` v10
- Tests : Playwright
- Node : ≥ 22.12.0

## Workflow de développement
- Dev server local : `npm run dev` → http://localhost:4321 avec hot-reload
- Les modifications sont faites directement dans les fichiers Astro (plus de previews HTML /tmp)
- Commit + push → déploiement Vercel automatique
