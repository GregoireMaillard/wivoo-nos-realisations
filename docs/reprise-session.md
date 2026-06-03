# Reprise de session — Prototype Wivoo "Nos Réalisations"

## État du projet au 03/06/2026

### Migration V2 → V3
Le projet a migré de HTML statique vers **Astro 6.4.1** + **Tailwind CSS v4** + adaptateur **@astrojs/vercel**.
Un back-office d'administration a été ajouté.

---

### Ce qui est terminé
- `src/pages/index.astro` — page principale avec grille 8 cartes et filtres par secteur
- `src/pages/case-studies/[slug].astro` — pages détail dynamiques (route unique pour les 8 cas)
- `src/pages/admin/index.astro` — liste des études de cas (back-office)
- `src/pages/admin/new.astro` — formulaire de création d'une nouvelle étude de cas
- `src/pages/admin/edit/[slug].astro` — formulaire d'édition d'une étude de cas
- `src/components/Navbar.astro` + `src/components/Footer.astro`
- `src/layouts/BaseLayout.astro`
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
| Slug | Secteur |
|------|---------|
| `optimisation-scores-predictifs` | Data |
| `service-client-btp` | Product |
| `ecommerce-pharma` | Product |
| `chatbot-genai-banque` | AI |
| `engagement-retail-sportif` | Design |
| `experience-beaute-cosmetiques` | Design |
| `abonnements-media-francais` | Data |
| `gestion-donnees-retail` | Data |

---

### Git — état local
- Branche : `main`
- 4 commits effectués, tout est commité
- Remote GitHub configuré (HTTPS) : `https://github.com/GregoireMaillard/wivoo-nos-realisations.git`
- **Push non effectué** — authentification GitHub HTTPS bloquée (même problème que V2)

### Déploiement
- `.vercel/output/` présent localement (build Vercel effectué via CLI)
- Statut du déploiement Vercel en ligne : **à vérifier**

---

## Ce qu'il reste à faire

### 1. Configurer l'authentification SSH pour GitHub (si non fait)
```bash
# Vérifier si une clé existe déjà
ls ~/.ssh/

# Si aucune clé : en générer une
ssh-keygen -t ed25519 -C "gregoire.maillard@wivoo.fr" -f ~/.ssh/id_ed25519 -N ""

# Afficher la clé publique à copier dans GitHub
cat ~/.ssh/id_ed25519.pub
```
Puis aller sur **github.com → Settings → SSH and GPG keys → New SSH key**.

### 2. Changer le remote en SSH et pusher
```bash
git remote set-url origin git@github.com:GregoireMaillard/wivoo-nos-realisations.git
git push -u origin main
```

### 3. Vérifier / déployer sur Vercel
- Si le projet est déjà connecté sur vercel.com → vérifier que le dernier commit est bien déployé
- Sinon : **vercel.com → Add New Project → connecter GitHub → `wivoo-nos-realisations` → Deploy**

---

## Couleurs secteurs (référence)
| Secteur | Couleur | Hex |
|---------|---------|-----|
| Product | Violet | `#6d28d9` |
| AI | Bleu cyan | `#0891b2` |
| Data | Vert émeraude | `#059669` |
| Design | Rose | `#db2777` |

## Footer
- Fond : `#160b52`
- Bannière réseaux : `#3a26b0`
- CTA vert : `#5BDF6A`

## Stack technique
- Framework : Astro 6.4.1
- CSS : Tailwind CSS v4 (via `@tailwindcss/vite`)
- Adaptateur : `@astrojs/vercel` v10
- Tests : Playwright
- Node : ≥ 22.12.0
