# Plan — Prototype "Nos Réalisations" Wivoo

## Contexte
Remplacement visuel de https://www.wivoo.fr/our-case-studies par un prototype HTML statique plus moderne. Livrable : un fichier unique `index.html` avec Tailwind CDN.

Objectif : "Best showcase in the world" — valoriser les 4 expertises Wivoo : Product, AI, Data, Design.

---

## Structure du fichier `index.html`

```
<head>
  Tailwind CDN + config (couleurs Wivoo)

<body>
  ├── Header — titre "Nos Réalisations" + sous-titre
  ├── FilterBar — boutons : Tous | Product | AI | Data | Design
  ├── Grid — 2 colonnes desktop / 1 colonne mobile
  │    └── 8× CaseStudyCard
  └── <script> — données mockées + logique de filtre
```

---

## Données mockées — 8 études de cas

2 par secteur (Product, AI, Data, Design) :

| Secteur | Titre                                  | Client fictif   |
|---------|----------------------------------------|-----------------|
| Product | Refonte de l'expérience d'onboarding   | Fintech X       |
| Product | Design system & roadmap produit        | Scale-up SaaS   |
| AI      | Assistant IA métier pour RH            | Groupe RH       |
| AI      | Moteur de recommandation personnalisé  | E-commerce      |
| Data    | Data platform & gouvernance            | Industrie       |
| Data    | Dashboard décisionnel temps réel       | Retail          |
| Design  | Identité de marque & design system     | Start-up B2B    |
| Design  | UX Research & prototypage              | Mobilité        |

Chaque objet JS : `{ id, sector, client, title, description, gradient }`
→ Pas d'images externes — fonds en CSS gradient par secteur.

---

## Design des cartes

**État normal** :
- Fond : gradient dédié au secteur (4 palettes distinctes)
- Badge secteur en haut à gauche (petit, pill shape)
- Titre en bas à gauche, blanc, typographie bold
- Ratio fixe : `aspect-[4/3]`

**Hover** :
- Overlay sombre semi-transparent (transition 300ms)
- Description courte apparaît (fade in)
- "Voir le cas →" en bas à droite

**Gradients par secteur** :
- Product → violet → indigo (`#6d28d9 → #4f46e5`)
- AI      → bleu roi → cyan (`#1d4ed8 → #0891b2`)
- Data    → vert émeraude → teal (`#059669 → #0d9488`)
- Design  → rose → orange (`#db2777 → #ea580c`)

---

## FilterBar

- Boutons pill : "Tous", "Product", "AI", "Data", "Design"
- État actif : fond sombre, texte blanc (contraste sur fond blanc global)
- JS : filtre les cartes par `data-sector`, toggle `hidden`

---

## Layout global

- Fond de page : `#ffffff` (blanc) — conforme à la charte Wivoo observée sur le site de référence
- Header centré : titre H1 large + sous-titre muted
- Grille : `grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto px-6`
- Responsive : 1 col mobile, 2 cols ≥ md

---

## Vérification

1. Ouvrir `index.html` directement dans le navigateur (pas de serveur requis)
2. Vérifier que les 8 cartes s'affichent en grille 2 colonnes
3. Cliquer chaque filtre → seules les cartes du secteur restent visibles
4. Passer la souris sur une carte → overlay + description apparaissent
5. Réduire la fenêtre → passage à 1 colonne sous 768px
