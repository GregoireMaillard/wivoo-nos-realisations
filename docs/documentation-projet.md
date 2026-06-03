# Documentation projet — « Nos Réalisations » Wivoo

> Prototype de refonte de la section *Réussite client* du site wivoo.fr.
> Document de présentation : contexte, choix fonctionnels / techniques / UX, état, et pistes d'évolution.

**En ligne :** https://wivoo-nos-realisations.vercel.app/
**Back-office :** https://wivoo-nos-realisations.vercel.app/admin

---

## 1. Résumé exécutif

Ce prototype reprend et améliore la page [« Nos cas clients »](https://www.wivoo.fr/our-case-studies) de wivoo.fr. Il poursuit deux objectifs :

1. **Valoriser les 4 expertises cœur de Wivoo** (Product, IA, Data, Design) et les résultats clients, pour servir la conversion de prospects B2B vers « Prendre RDV ».
2. **Rendre la page autonome pour les équipes commerciales** : un back-office permet d'ajouter / modifier / publier une réalisation **sans toucher au code**.

Ce qui a été livré, par rapport à la page d'origine (grille de 8 cartes, sans filtre ni description) :
- une **page vitrine enrichie** : filtres par expertise et par secteur, vues grille/liste, cartes avec résultat chiffré, pages de détail complètes ;
- un **back-office fonctionnel** avec upload d'image, publication/dépublication et persistance automatique en production.

---

## 2. Contexte & objectifs

| | |
|---|---|
| **Référence** | wivoo.fr/our-case-studies — grille 2 colonnes, 8 cas, sans filtre ni description |
| **Inspirations** | wefiit.com/cas-clients, thiga.co/fr/cas-client, ustwo.com/work |
| **Cible** | Prospects B2B, décideurs, DSI — lecture rapide, **desktop-first**, objectif conversion |
| **Contrainte** | Respecter la charte Wivoo et représenter les 8 cas existants |

---

## 3. Schéma — Architecture **fonctionnelle**

Deux parcours indépendants : le visiteur (site public) et le commercial (back-office).

```
┌───────────────────────── VISITEUR (prospect B2B) ──────────────────────────┐
│                                                                             │
│  PAGE "NOS RÉALISATIONS"  ( / )                                             │
│  ├─ Hero (accroche)                                                         │
│  ├─ Barre de filtres (sticky)                                               │
│  │    • Expertise : Product · AI · Data · Design   ← couleurs = différenciant│
│  │    • Secteur   : BTP · Banque · Retail · …      ← gris = critère secondaire│
│  │    • Logique ET entre les 2 + compteur + bascule Grille / Liste          │
│  ├─ Cartes (image, badge expertise coloré, badge secteur, titre, KPI, CTA)  │
│  │                                                                          │
│  └─ clic ─────────────────►  PAGE DÉTAIL ( /case-studies/:slug )            │
│                              ├─ Hero image + titre                          │
│                              ├─ Principaux résultats (3 KPIs)               │
│                              ├─ Le défi                                     │
│                              ├─ Notre solution (étapes)                     │
│                              └─ CTA « Prendre RDV »                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────── COMMERCIAL (back-office /admin) ────────────────────┐
│  LISTE DES RÉALISATIONS                                                     │
│  ├─ Publier / Dépublier   (bouton en cooldown ~1 min en prod après action)  │
│  ├─ Modifier  ───────────►  Formulaire d'édition (upload image optionnel)   │
│  ├─ Supprimer                                                               │
│  └─ + Nouvelle ──────────►  Formulaire de création (upload image requis)    │
│                                                                             │
│  Champ image = composant d'upload : aperçu, validation 4 Mo, zéro chemin    │
│  à manipuler. Bandeaux de feedback : « Enregistré », conflit, erreur.       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Schéma — Architecture **technique**

La donnée vit dans le dépôt GitHub. Le site public est **statique** ; le back-office est **rendu à la demande** (SSR) et écrit dans le dépôt, ce qui déclenche un redéploiement.

```
                       SOURCE DE VÉRITÉ  (dépôt GitHub)
               ┌────────────────────────────────────────────┐
               │  src/data/cases.json      → les données      │
               │  public/case-images/*.jpg → les images       │
               └────────────────────────────────────────────┘
                    ▲                                   │
       (1) écrit    │                                   │ (4) lu au build
       via API      │                                   ▼
  ┌─────────────────┴────────────┐         ┌──────────────────────────────┐
  │  BACK-OFFICE  /admin         │         │   BUILD VERCEL  (à chaque push)│
  │  SSR (prerender = false)     │         │   Astro génère le site         │
  │                              │         │   statique (prerender = true)  │
  │  • writeCasesWithImage()     │         └───────────────┬──────────────┘
  │      commit ATOMIQUE         │                         │ (5) déploie
  │      (image + données)       │                         ▼
  │      via API Git Data        │         ┌──────────────────────────────┐
  │  • writeCases()              │         │   SITE PUBLIC  (statique)      │
  │      publier / supprimer     │         │   /   et   /case-studies/:slug │
  │  • readCasesLive()           │         └───────────────┬──────────────┘
  │      lit l'état à jour GitHub │                         │
  └──────────────┬───────────────┘                         │
                 ▲                                          ▼
                 │ édite                            consulte │
          ┌──────┴───────┐                          ┌────────┴─────┐
          │  Commercial  │                          │  Prospect    │
          └──────────────┘                          └──────────────┘

  Délai (1) → (5) ≈ 1 minute (régénération).
  En LOCAL (npm run dev) : écriture directe des fichiers, pas de commit, instantané.
```

**Pourquoi ce design ?** Sur Vercel, le système de fichiers des fonctions serverless est en lecture seule. On ne peut donc pas « enregistrer dans un dossier » au runtime : la persistance passe par un **commit Git**, qui a l'avantage de **versionner** données et images gratuitement.

---

## 5. Périmètre fonctionnel

### Site public
- **Filtres double rangée** — *Expertise* (Product/AI/Data/Design) et *Secteur* (BTP, Banque, Retail…), combinés en **logique ET**, avec compteur de résultats et **état vide** (« Aucune réalisation… » + bouton de réinitialisation).
- **Deux vues** — grille (3 colonnes) et liste, au choix de l'utilisateur.
- **Cartes** — image, badge d'expertise coloré, badge de secteur, titre, **1er KPI mis en avant**, lien « Voir le cas ».
- **Pages de détail** — hero, 3 KPIs encadrés, le défi, la solution (étapes), CTA « Prendre RDV ».
- **Navbar / Footer** — repris de wivoo.fr (logo, menus déroulants vers les vraies pages, CTA), footer charté.

### Back-office (`/admin`)
- **Lister** les réalisations (statut publié / brouillon).
- **Créer / Modifier / Supprimer** une réalisation.
- **Publier / Dépublier** (un brouillon n'apparaît pas sur le site public).
- **Uploader une image** (composant dédié, validation 4 Mo, aperçu instantané).
- **Feedback** : confirmation, gestion des conflits d'édition concurrente, cooldown après publication.

---

## 6. Choix UX/UI (justifiés)

| Décision | Justification (principe) |
|---|---|
| **Filtres séparés en 2 rangées**, Expertise en **couleur**, Secteur en **gris** | Hiérarchie visuelle : la couleur est réservée au **différenciant de Wivoo** (les expertises). Le secteur, secondaire, reste neutre pour ne pas rivaliser. |
| **Logique ET + état vide + bouton reset** | Prévention des impasses : une combinaison sans résultat propose une sortie claire (Nielsen — *error prevention* + *recovery*). |
| **Barre de filtres sticky** sous la navbar | Accès permanent au filtrage pendant le scroll (*recognition over recall*). |
| **Bascule grille / liste** | Liberté de l'utilisateur ; la vue liste favorise le **scan rapide** typique des décideurs. |
| **KPI chiffré mis en avant sur la carte** | Message orienté **résultat** d'emblée : preuve de valeur avant la description (lecture en < 5 s, cible B2B). |
| **Titre tronqué à 3 lignes** | Régularité de la grille, charge cognitive maîtrisée. |
| **Page détail : résultats AVANT le défi/solution** | Narration *outcome-first* adaptée aux décideurs. |
| **CTA « Prendre RDV » vert vif, récurrent** | Contraste fort, cible cliquable large (loi de Fitts), au service de la conversion. |
| **Bandeaux de feedback + cooldown dans l'admin** | *Visibility of system status* (Nielsen #1) : l'utilisateur comprend que sa modification est prise en compte et quand elle sera visible. |
| **Upload d'image sans manipulation de chemin** | *Match between system and real world* : un commercial dépose un fichier, il ne gère pas d'URL ni de path. Réduction de la friction. |
| **Desktop-first** | Cible DSI / décideurs, contexte de consultation principalement desktop. |

### Charte (référence)
| Usage | Couleur |
|---|---|
| Product | `#6d28d9` (violet) |
| IA | `#0891b2` (cyan) |
| Data | `#059669` (vert) |
| Design | `#db2777` (rose) |
| Hero | `#f0eeff` |
| Fond page | `#f9fafb` |
| Footer | `#160b52` |
| CTA | `#5BDF6A` |

---

## 7. Choix techniques (justifiés)

| Décision | Justification |
|---|---|
| **Astro** (framework) | Site **statique par défaut** → performances (chargement rapide, bon SEO), coût d'hébergement faible, simplicité. Rendu à la demande (SSR) **uniquement** pour le back-office, là où c'est nécessaire. |
| **Tailwind CSS v4** | Stylage rapide et cohérent, charte appliquée directement dans le markup. |
| **JS « vanilla »** pour les filtres | Pas de framework front lourd : interactions simples, JavaScript minimal envoyé au visiteur. |
| **Données en JSON versionné** (`cases.json`) | Pas d'infrastructure de base de données ; contenu **historisé** dans Git. Choix dimensionné sur une fréquence d'édition faible. |
| **Persistance par commit Git** (back-office) | Imposée par le filesystem en lecture seule de Vercel. Le commit déclenche le redéploiement et **versionne** chaque modification. |
| **Commit atomique via l'API Git Data** (création/édition avec image) | Image **et** données dans **un seul commit** → pas d'état intermédiaire incohérent, un seul rebuild. |
| **`readCasesLive()`** dans l'admin | Lit l'état à jour depuis GitHub plutôt que le bundle déployé → l'admin reflète immédiatement les changements sans attendre le rebuild. |
| **Déploiement Vercel sur push** | Chaîne d'intégration simple : `git push` → build → mise en ligne automatique. |

### Sécurité (état actuel)
- **Protection CSRF** active (Astro `checkOrigin`) sur les écrans d'administration.
- Le **token GitHub** reste côté serveur (variables d'environnement Vercel), jamais exposé au navigateur.
- ⚠️ **Pas d'authentification** sur `/admin` à ce stade — voir limites (§9).

---

## 8. Arborescence du projet

```
src/
├── pages/
│   ├── index.astro              Page vitrine (filtres, grille/liste)        [statique]
│   ├── case-studies/[slug].astro Page détail d'une réalisation              [statique]
│   └── admin/
│       ├── index.astro          Liste + publier/supprimer + cooldown        [SSR]
│       ├── new.astro            Création (upload image requis)              [SSR]
│       └── edit/[slug].astro    Édition (upload image optionnel)            [SSR]
├── components/
│   ├── Navbar.astro             Navbar charte Wivoo (menus, CTA)
│   ├── Footer.astro             Footer charte Wivoo
│   └── ImageUpload.astro        Composant d'upload réutilisable (4 Mo, aperçu)
├── layouts/
│   └── BaseLayout.astro         Squelette HTML, favicon, fond global
├── lib/
│   └── cases.ts                 Lecture/écriture données, upload, couleurs
├── data/
│   └── cases.json               SOURCE DE VÉRITÉ des réalisations
└── styles/
    └── global.css               Import Tailwind
public/
└── case-images/                 Images uploadées via le back-office
docs/
├── documentation-projet.md      Ce document
├── back-office.md               Note d'exploitation (env vars, token, sécurité)
└── reprise-session.md           Journal de reprise de session
```

---

## 9. État actuel & limites connues (transparence)

### Ce qui fonctionne et est en ligne
- Site vitrine complet (filtres, vues, détail) + 9 réalisations.
- Back-office opérationnel en production : CRUD, publication, **upload d'image** (testé de bout en bout, commit atomique validé).
- Déploiement automatique Vercel.

### Limites assumées / dette technique
| Sujet | Détail | Criticité |
|---|---|---|
| **Authentification** | `/admin` est ouvert sans login (choix assumé pour la démo). | 🔴 À traiter avant toute exposition réelle |
| **Commit par sauvegarde** | Chaque modification = 1 commit `chore(admin)`. Acceptable à faible fréquence ; seuil de bascule documenté dans `back-office.md`. | 🟡 |
| **Images orphelines** | Remplacer une image en édition ne supprime pas l'ancienne du dépôt. | 🟡 |
| **Images non optimisées** | Les images uploadées sont servies telles quelles (seule limite : 4 Mo). | 🟡 |
| **Secteur déduit du sous-titre** | L'industrie est extraite de la chaîne `… — Secteur` ; convention fragile. | 🟡 |
| **SEO par cas** | Pas de `og:image` ni meta description spécifiques par réalisation. | 🟡 |
| **Tests automatisés** | Playwright est présent mais aucune suite de tests n'est versionnée. | 🟡 |
| **Hygiène dépôt** | Pas de `.gitignore` (dist/, node_modules suivis comme non trackés). | 🟢 |

---

## 10. Roadmap — améliorations possibles (si le projet continue)

Priorisé du plus structurant au plus secondaire.

### Priorité 1 — fiabiliser
- **Authentification du back-office** : middleware Astro + mot de passe partagé, ou SSO Wivoo.
- **Suppression de l'ancienne image** lors d'un remplacement (éviter les orphelins).

### Priorité 2 — valoriser & convertir
- **SEO par réalisation** : `og:image`, meta description, données structurées, sitemap.
- **Optimisation des images** à l'upload (redimensionnement / compression, ou pipeline d'images).
- **Page détail enrichie** : témoignage client, navigation précédent/suivant entre cas.
- **Animations d'apparition** des cartes au scroll.

### Priorité 3 — passer à l'échelle / mesurer
- **Faire évoluer la persistance** si la fréquence d'édition augmente (branche de contenu dédiée, ou base de données + revalidation) — décision et seuil documentés dans `back-office.md`.
- **Analytics** : suivi de l'usage des filtres et du taux de clic sur les CTA ; A/B test du CTA.
- **Internationalisation** (version anglaise), mode sombre.
- **Suite de tests** end-to-end (Playwright) pour sécuriser les évolutions.

---

## 11. Stack & informations utiles

- **Framework** : Astro 6.4.1 · **CSS** : Tailwind v4 · **Adaptateur** : @astrojs/vercel · **Node** ≥ 22.12
- **Dépôt** : `GregoireMaillard/wivoo-nos-realisations` (branche `main`)
- **Déploiement** : Vercel, automatique à chaque push sur `main`
- **Lancer en local** : `npm run dev` → http://localhost:4321
- **Documents liés** : `docs/back-office.md` (exploitation), `docs/reprise-session.md` (journal)
