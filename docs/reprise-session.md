# Reprise de session — Prototype Wivoo "Nos Réalisations"

## État du projet au 03/06/2026

### Migration V2 → V3
Le projet a migré de HTML statique vers **Astro 6.4.1** + **Tailwind CSS v4** + adaptateur **@astrojs/vercel**.
Un back-office d'administration a été ajouté.

---

### Ce qui est terminé
- `src/pages/index.astro` — page principale avec toggle grille/liste, filtres par secteur, hero violet clair, fond gris
- `src/pages/case-studies/[slug].astro` — pages détail avec bouton retour, breadcrumb, KPIs bordés, défi, solution, CTA
- `src/pages/admin/index.astro` — liste des études de cas (back-office)
- `src/pages/admin/new.astro` — formulaire de création d'une nouvelle étude de cas
- `src/pages/admin/edit/[slug].astro` — formulaire d'édition d'une étude de cas
- `src/components/Navbar.astro` — navbar sticky avec dropdowns au hover (liens wivoo.fr réels)
- `src/components/Footer.astro`
- `src/layouts/BaseLayout.astro` — favicon Wivoo, fond gris global
- `src/data/cases.json` — source de données des 8 études de cas
- `src/lib/cases.ts` — helpers TypeScript pour accéder aux données
- `src/styles/global.css`
- `CLAUDE.md` — règles et contexte projet (à jour)
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
| `ecommerce-pharma` | Product | Pharma / Santé |
| `chatbot-genai-banque` | AI | Banques & Assurances |
| `engagement-retail-sportif` | Design | Retail |
| `experience-beaute-cosmetiques` | Design | Cosmétique |
| `abonnements-media-francais` | Data | Médias |
| `gestion-donnees-retail` | Data | Retail |

---

### Git — état local
- Branche : `main`
- 17 commits effectués, tout est commité et pushé
- Remote GitHub (SSH) : `git@github.com:GregoireMaillard/wivoo-nos-realisations.git`
- **Push OK** — remote passé en SSH lors de la session du 03/06/2026

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

---

## Ce qu'il reste à faire / pistes d'amélioration

- Animations d'entrée des cards au scroll (Intersection Observer)
- Témoignages clients sur les pages détail
- Navigation entre cas (précédent / suivant) sur les pages détail
- Mode sombre
- SEO : og:image et meta description par cas
- Back-office : rendre l'édition des cas fonctionnelle (write to JSON)

---

## Couleurs secteurs (référence)
| Secteur | Couleur | Hex |
|---------|---------|-----|
| Product | Violet | `#6d28d9` |
| AI | Bleu cyan | `#0891b2` |
| Data | Vert émeraude | `#059669` |
| Design | Rose | `#db2777` |

## Autres couleurs
- Hero / filtres : `#f0eeff` (violet très clair)
- Fond page : `#f9fafb` (gray-50)
- Footer fond : `#160b52`
- Footer bannière réseaux : `#3a26b0`
- CTA vert : `#5BDF6A`

## Stack technique
- Framework : Astro 6.4.1
- CSS : Tailwind CSS v4 (via `@tailwindcss/vite`)
- Adaptateur : `@astrojs/vercel` v10
- Tests : Playwright
- Node : ≥ 22.12.0
