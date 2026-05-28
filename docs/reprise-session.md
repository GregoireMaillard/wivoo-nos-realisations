# Reprise de session — Prototype Wivoo "Nos Réalisations"

## État du projet au 27/05/2026

### Ce qui est terminé
- `index.html` — page principale avec grille 8 cartes, filtres colorés par secteur, navbar Wivoo, footer violet
- `case-studies/` — 8 pages détail complètes (hero, KPIs, défi, solution, footer)
- `CLAUDE.md` — règles et contexte projet
- `docs/plan.md` — plan d'implémentation

### Structure des fichiers
```
PrototypeChallengeShowcase_V2/
├── index.html
├── CLAUDE.md
├── docs/
│   ├── plan.md
│   └── reprise-session.md (ce fichier)
└── case-studies/
    ├── optimisation-scores-predictifs.html   (Data)
    ├── service-client-btp.html               (Product)
    ├── ecommerce-pharma.html                 (Product)
    ├── chatbot-genai-banque.html             (AI)
    ├── engagement-retail-sportif.html        (Design)
    ├── experience-beaute-cosmetiques.html    (Design)
    ├── abonnements-media-francais.html       (Data)
    └── gestion-donnees-retail.html           (Data)
```

### Git — état local
- Branche : `main`
- 3 commits effectués, tout est commité
- Remote GitHub configuré : `https://github.com/GregoireMaillard/wivoo-nos-realisations.git`
- **Push non effectué** — authentification GitHub manquante

### Déploiement actuel
- **Netlify** (temporaire) : https://6a1708729c2bfe27c2cbcfb3--dulcet-licorice-d8e001.netlify.app/
- **Vercel** : non déployé (bloqué sur l'auth GitHub)

---

## Ce qu'il reste à faire

### 1. Configurer l'authentification SSH pour GitHub
Aucune clé SSH existante sur la machine. Commandes à lancer dans le terminal :

```bash
# Générer une clé SSH
ssh-keygen -t ed25519 -C "gregoire.maillard@wivoo.fr" -f ~/.ssh/id_ed25519 -N ""

# Afficher la clé publique à copier dans GitHub
cat ~/.ssh/id_ed25519.pub
```

Puis aller sur **github.com → Settings → SSH and GPG keys → New SSH key** et coller la clé.

### 2. Changer le remote en SSH et pusher
```bash
git -C /Users/gregoiremaillard/Desktop/FormationProductBuilder/PrototypeChallengeShowcase_V2 remote set-url origin git@github.com:GregoireMaillard/wivoo-nos-realisations.git

git -C /Users/gregoiremaillard/Desktop/FormationProductBuilder/PrototypeChallengeShowcase_V2 push -u origin main
```

### 3. Déployer sur Vercel
Une fois le code sur GitHub :
- Aller sur **vercel.com** → "Add New Project"
- Connecter GitHub → sélectionner `wivoo-nos-realisations`
- Cliquer Deploy (aucune config nécessaire, site statique)

---

## Couleurs secteurs (pour cohérence future)
| Secteur | Couleur | Hex |
|---------|---------|-----|
| Product | Violet  | `#6d28d9` |
| AI      | Bleu cyan | `#0891b2` |
| Data    | Vert émeraude | `#059669` |
| Design  | Rose | `#db2777` |

## Footer
- Fond : `#160b52`
- Bannière réseaux : `#3a26b0`
- CTA vert : `#5BDF6A`
