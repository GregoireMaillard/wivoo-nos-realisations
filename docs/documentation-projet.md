# « Nos Réalisations » Wivoo — Présentation du prototype

> **En une phrase** — Une refonte de la page « cas clients » de wivoo.fr qui transforme une simple galerie d'images en **vitrine orientée conversion**, doublée d'un **back-office autonome** permettant aux commerciaux d'alimenter la page sans développeur.

**🔗 Démo :** https://wivoo-nos-realisations.vercel.app/ · **Back-office :** …/admin

---

## En bref (pour décideur — 30 s)

**Le problème.** La page actuelle de wivoo.fr aligne 8 cas clients (image + titre), sans filtre, sans résultat visible, sans détail. Elle informe, mais ne **convertit** pas et n'est pas **maintenable** par les équipes métier.

**La réponse.** Un prototype qui :
- **valorise les expertises Wivoo** (Product, IA, Data, Design) et **les résultats chiffrés**, pour convertir des prospects B2B vers « Prendre RDV » ;
- **rend la page autonome** : les commerciaux ajoutent / modifient / publient une réalisation depuis un back-office, **sans toucher au code**, image comprise.

**Là où on en est.** Vitrine + back-office **en ligne et fonctionnels** (authentification, upload d'image et vidéo YouTube inclus), déploiement automatique, et une feuille de route claire pour la suite.

---

## Avant / Après

| | Page actuelle wivoo.fr | Prototype |
|---|---|---|
| Présentation | Grille d'images + titre | Cartes avec **expertise, secteur, résultat chiffré** |
| Filtrage | Aucun | **Par expertise et par secteur** (combinables) |
| Lecture des résultats | Absente | **KPI mis en avant** dès la carte |
| Détail d'un cas | — | **Page dédiée** (résultats, défi, solution, CTA) |
| Vues | Une seule | **Grille ou liste** au choix |
| Mise à jour du contenu | Par un développeur | **Par les commerciaux**, en autonomie |

---

## Fil conducteur de démo suggéré

1. **Le site public** — montrer le filtrage par expertise (couleurs Wivoo) puis par secteur, basculer grille/liste, ouvrir une page de cas (résultats → défi → solution → CTA).
2. **Le back-office** — créer une réalisation, **uploader une image** (sans manipuler d'URL), publier ; montrer qu'elle apparaît sur le site.
3. **Le propos** — ce prototype sert deux objectifs : *convertir* (côté vitrine) et *rendre l'équipe autonome* (côté back-office).

---

## Contexte & objectifs

| | |
|---|---|
| **Référence** | wivoo.fr/our-case-studies — grille 2 colonnes, 8 cas, sans filtre ni description |
| **Inspirations** | wefiit.com/cas-clients, thiga.co/fr/cas-client, ustwo.com/work |
| **Cible** | Prospects B2B, décideurs, DSI — lecture rapide, **desktop-first**, objectif conversion |
| **Contrainte** | Respecter la charte Wivoo et représenter les cas existants |

---

## Lecture Product (regard PM senior)

> *Ce que ce prototype cherche à prouver, pour qui, et comment on saurait que ça marche.*

### Utilisateurs & besoins (jobs-to-be-done)
- **Prospect B2B / décideur (DSI, direction métier)** — *« Quand j'évalue un cabinet, je veux voir vite des preuves concrètes pertinentes pour mon secteur, pour décider de prendre RDV. »*
- **Commercial Wivoo** — *« Quand une mission se termine, je veux publier la réalisation moi-même, rapidement et sans dépendre d'un développeur, pour garder la vitrine à jour et nourrir mes RDV. »*
- **Marketing (implicite)** — cohérence de marque et de charte.

### Objectifs & indicateurs de succès (à instrumenter)
- **North star** : taux de conversion vers « Prendre RDV » depuis la section réalisations.
- **Côté vitrine** : clic carte → détail, usage des filtres, clic CTA, profondeur de scroll, rebond.
- **Côté back-office (efficacité opérationnelle)** : délai « mission terminée → cas publié », nombre de cas publiés / mois, **part de publications faites sans développeur** (cible : 100 %).
- ⚠️ **Aucune analytique branchée à ce jour** — ces indicateurs sont **à instrumenter** (roadmap P3). C'est un prototype : pas de résultats chiffrés à présenter, mais un cadre de mesure prêt à l'emploi.

### Périmètre MVP & hors-périmètre (discipline produit)
- **Dans le périmètre** : filtrage, vues grille/liste, pages détail, vidéo YouTube, back-office CRUD + upload d'image + publication + **authentification**.
- **Hors-périmètre assumé** (pour livrer vite la preuve de valeur) : optimisation d'image, SEO par cas, analytics, i18n, tests automatisés → tous **priorisés** dans la roadmap.
- **Logique** : livrer d'abord la valeur démontrable (vitrine qui convertit + autonomie des commerciaux), repousser ce qui ne bloque pas la démonstration.

### Hypothèses à valider
- **H1 — valeur visiteur** : exposer expertises + résultats chiffrés + filtres augmente la conversion vers RDV → à valider par analytics / A/B test.
- **H2 — adoption interne** : si la friction est faible (upload sans technique), les commerciaux maintiendront la page eux-mêmes → à valider par l'usage réel et leur retour.
- **H3 — fréquence d'édition** : « quelques fois / mois » → l'architecture statique + commit suffit. Si infirmée, bascule prévue (branche de contenu ou base de données).

### Arbitrages clés (build vs buy)
- **Source de vérité** : solution **sur-mesure** (JSON + Git) plutôt que Notion ou un CMS tiers → maîtrise totale et zéro outil externe, au prix de porter l'interface nous-mêmes. Assumé pour un prototype.
- **Persistance** : **commit Git** plutôt qu'une base de données → simplicité + versioning, au prix d'un commit par sauvegarde (seuil de bascule documenté dans `back-office.md`).

---

## Architecture **fonctionnelle**

> *À lire ainsi :* deux usages distincts — le **prospect** qui consulte (site public), le **commercial** qui alimente (back-office).

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

## Architecture **technique**

> *À lire ainsi :* la donnée vit dans GitHub. Le site public est **statique** (rapide, peu coûteux) ; le back-office **écrit dans GitHub**, ce qui régénère le site automatiquement.

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
  │  SSR (rendu à la demande)    │         │   Astro génère le site         │
  │                              │         │   statique                     │
  │  • commit ATOMIQUE           │         └───────────────┬──────────────┘
  │    (image + données)         │                         │ (5) déploie
  │  • publier / supprimer       │                         ▼
  │  • lit l'état à jour GitHub  │         ┌──────────────────────────────┐
  └──────────────┬───────────────┘         │   SITE PUBLIC  (statique)      │
                 ▲                          │   /   et   /case-studies/:slug │
                 │ édite                    └───────────────┬──────────────┘
          ┌──────┴───────┐                          consulte │
          │  Commercial  │                          ┌────────┴─────┐
          └──────────────┘                          │  Prospect    │
                                                     └──────────────┘

  Délai (1) → (5) ≈ 1 minute (régénération automatique).
  En local : écriture directe des fichiers, instantané.
```

**Le choix structurant en clair :** sur Vercel, on ne peut pas « enregistrer dans un dossier » au moment où le commercial clique (système de fichiers en lecture seule). La sauvegarde passe donc par un **commit Git** — ce qui a un double avantage : ça déclenche la mise en ligne **et** ça **archive chaque version** du contenu (historique, retour arrière possibles).

---

## Périmètre fonctionnel

**Site public**
- **Filtres double rangée** — Expertise (Product/AI/Data/Design) et Secteur, combinés en **logique ET**, avec compteur et **état vide** (message + bouton réinitialiser).
- **Deux vues** — grille (3 colonnes) ou liste.
- **Cartes** — image, badge expertise coloré, badge secteur, titre, **résultat chiffré mis en avant**, lien « Voir le cas ».
- **Pages de détail** — hero, 3 KPIs, le défi, la solution, **vidéo YouTube** (optionnelle), CTA « Prendre RDV ».
- **Navbar / Footer** chartés, repris de wivoo.fr.

**Back-office (`/admin`)**
- **Accès protégé par authentification** (mot de passe + session). Lister, **créer / modifier / supprimer**, **publier / dépublier**, **uploader une image** (composant dédié, 4 Mo, aperçu), **ajouter une vidéo YouTube**, avec retours de confirmation et gestion des conflits.

---

## Choix UX/UI — décision → bénéfice

| Décision | Bénéfice | Principe |
|---|---|---|
| Expertise **en couleur**, Secteur **en gris** | Le prospect identifie d'emblée le **positionnement Wivoo** ; le secteur reste un filtre secondaire | Hiérarchie visuelle |
| **Logique ET + état vide + reset** | Aucune impasse : une recherche sans résultat propose une sortie | Prévention/​récupération d'erreur (Nielsen) |
| **Résultat chiffré sur la carte** | Preuve de valeur **immédiate**, avant même la description | *Outcome-first*, lecture < 5 s |
| **Barre de filtres sticky** | Filtrage accessible en permanence pendant le scroll | *Recognition over recall* |
| **Bascule grille / liste** | S'adapte au mode de lecture du décideur (scan rapide) | Liberté de l'utilisateur |
| **Détail : résultats avant défi/solution** | Récit orienté impact, adapté aux décideurs | *Outcome-first* |
| **CTA « Prendre RDV » vert récurrent** | Action de conversion toujours visible et facile à atteindre | Loi de Fitts |
| **Feedback + cooldown dans l'admin** | Le commercial sait que sa modif est prise en compte et quand elle sera visible | *Visibility of system status* (Nielsen #1) |
| **Upload sans manipulation de chemin** | Un commercial dépose un fichier — aucune notion technique d'URL/path | *Match system / monde réel* |
| **Desktop-first** | Cohérent avec la consultation DSI/décideurs | Adéquation au contexte d'usage |

**Charte couleurs :** Product `#6d28d9` · IA `#0891b2` · Data `#059669` · Design `#db2777` · Hero `#f0eeff` · Fond `#f9fafb` · Footer `#160b52` · CTA `#5BDF6A`.

---

## Choix techniques — décision → bénéfice

| Décision | Bénéfice |
|---|---|
| **Astro, site statique par défaut** | Pages publiques **rapides** et **bien référencées**, hébergement **peu coûteux** |
| **Rendu à la demande (SSR) uniquement pour l'admin** | Du dynamique seulement là où c'est utile, sans alourdir la vitrine |
| **Données en JSON versionné** | Pas de base de données à gérer ; **contenu historisé** dans Git |
| **Persistance par commit Git** | Sauvegarde + mise en ligne + **archivage** en une seule mécanique |
| **Commit atomique (image + données)** | Pas d'état incohérent, **une seule mise à jour** par sauvegarde |
| **Lecture « live » dans l'admin** | Le back-office reflète les changements **immédiatement**, sans attendre la régénération |
| **Déploiement automatique Vercel** | `git push` → mise en ligne, sans intervention manuelle |

**Sécurité (état actuel) :** **authentification du back-office** (middleware Astro + mot de passe partagé `ADMIN_PASSWORD` + session signée HMAC, cookie httpOnly/Secure) ; protection anti-CSRF active ; le jeton GitHub reste **côté serveur** (jamais exposé). L'auth s'active dès que `ADMIN_PASSWORD` est définie côté Vercel (sinon `/admin` reste ouvert en local pour le dev).

---

## État actuel & limites assumées

**En ligne et fonctionnel :** vitrine complète + back-office opérationnel en production (création, édition, publication, **upload d'image** et **vidéo YouTube** validés de bout en bout, **authentification**), déploiement automatique.

| Limite | Détail | Criticité |
|---|---|---|
| **Un commit par sauvegarde** | Acceptable à faible fréquence ; seuil de bascule documenté | 🟡 |
| **Images orphelines** | Remplacer une image ne supprime pas l'ancienne | 🟡 |
| **Images non optimisées** | Servies telles quelles (limite 4 Mo) | 🟡 |
| **Secteur déduit du sous-titre** | Convention de saisie un peu fragile | 🟡 |
| **SEO par cas / tests automatisés** | Non encore en place | 🟡 |

---

## Roadmap — si le projet continue (priorisé)

> Priorisé par **impact × effort** : P1 = ce qui débloque un usage réel, P2 = ce qui sert la conversion, P3 = ce qui fait passer à l'échelle et permet de mesurer.

**Priorité 1 — fiabiliser**
- ✅ ~~Authentification du back-office~~ — **fait** (à activer en posant `ADMIN_PASSWORD` dans Vercel). Évolution possible : SSO Wivoo.
- Suppression de l'ancienne image lors d'un remplacement.

**Priorité 2 — valoriser & convertir**
- SEO par réalisation (`og:image`, méta, données structurées, sitemap).
- Optimisation des images à l'upload.
- Page détail enrichie (témoignage client, navigation entre cas), animations au scroll.

**Priorité 3 — passer à l'échelle & mesurer**
- Faire évoluer la persistance si les éditions deviennent fréquentes (branche de contenu ou base de données).
- Analytics (usage des filtres, taux de clic CTA), A/B test du CTA.
- Version anglaise, mode sombre, suite de tests end-to-end.

---

## Annexe — stack & infos

- **Astro 6.4** · **Tailwind v4** · **Vercel** · **Node ≥ 22.12**
- Dépôt `GregoireMaillard/wivoo-nos-realisations` (branche `main`), déploiement automatique à chaque push
- Lancer en local : `npm run dev` → http://localhost:4321
- Documents liés : `back-office.md` (exploitation : jeton, variables, sécurité, décision commit-par-sauvegarde), `reprise-session.md` (journal)
