# Wivoo — « Nos Réalisations »

Prototype de refonte de la section cas clients de [wivoo.fr](https://www.wivoo.fr/our-case-studies) :
une **vitrine orientée conversion** (filtres par expertise/secteur, vues grille/liste, pages
détail avec résultats chiffrés et vidéo) doublée d'un **back-office** permettant aux équipes
d'ajouter, éditer et publier des réalisations — image et vidéo comprises — **sans toucher au code**.

**En ligne :** https://wivoo-nos-realisations.vercel.app/

## Stack

- [Astro](https://astro.build) — site public **statique** + back-office **SSR**
- [Tailwind CSS v4](https://tailwindcss.com)
- Déploiement **Vercel** (automatique à chaque push sur `main`)
- Données versionnées dans `src/data/cases.json` ; persistance back-office via l'API GitHub

## Développement

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # build de production
```

## Documentation (`docs/`)

| Fichier | Contenu |
| --- | --- |
| `documentation-projet.md` | Présentation : contexte, choix UX/techniques, schémas d'architecture, roadmap |
| `back-office.md` | Exploitation : variables d'environnement, token GitHub, authentification |
| `script-demo.md` | Script de prise de parole pour la démo |
| `reprise-session.md` | Journal de reprise de session |
| `archive/` | Documents obsolètes conservés pour l'historique (ex. plan de la v1) |
