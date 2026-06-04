# Back-office — Note d'exploitation

Documentation du fonctionnement et de la configuration du back-office de gestion
des réalisations (`/admin`).

## Authentification

Le back-office `/admin` est protégé par un **middleware Astro** (`src/middleware.ts`)
qui redirige vers `/admin/login` tant que la session n'est pas valide. La logique
est dans `src/lib/auth.ts`.

- **Mot de passe partagé** : variable d'env `ADMIN_PASSWORD`. Sert aussi de clé de
  signature des sessions (une seule variable à configurer).
- **Session** : cookie `wivoo_admin_session` signé en HMAC-SHA256 (jamais le mot de
  passe en clair), `httpOnly`, `SameSite=Lax`, `Secure` en prod, valable 7 jours.
  Comparaisons à temps constant.
- **Pages** : `/admin/login` (connexion), `/admin/logout` (déconnexion). Lien
  « Déconnexion » dans l'en-tête de l'admin.

### ⚠️ Activation
L'auth n'est **active que si `ADMIN_PASSWORD` est définie** :
- **Production (Vercel)** : définir `ADMIN_PASSWORD` → `/admin` exige le mot de passe.
- **Local (`npm run dev`)** : variable absente → `/admin` reste ouvert (confort de dev).

> Tant que `ADMIN_PASSWORD` n'est pas configurée côté Vercel, `/admin` reste **ouvert
> en production**. C'est l'unique action restante pour verrouiller le back-office.

Évolution possible : SSO Wivoo / comptes individuels (le partagé suffit pour quelques
commerciaux).

---

## Comment ça marche

La source de vérité des réalisations est le fichier **`src/data/cases.json`**,
versionné dans le repo. Le site public (`/` et `/case-studies/[slug]`) est
**statique** : il est régénéré à chaque build à partir de ce fichier.

L'écriture depuis le back-office a deux comportements selon l'environnement
(logique dans `src/lib/cases.ts` → `writeCases`) :

| Environnement | Détection | Persistance |
|---|---|---|
| **Local** (`npm run dev`) | `GITHUB_TOKEN` absent | `writeFileSync` direct sur `cases.json` (instantané) |
| **Production** (Vercel) | `GITHUB_TOKEN` présent | Commit `cases.json` via l'API GitHub Contents |

En production, le commit GitHub déclenche le **redéploiement automatique Vercel**,
qui régénère le site statique. Délai typique : **~1 minute** entre la sauvegarde
et la mise à jour visible sur le site public.

> Pourquoi pas `writeFileSync` en prod ? Le système de fichiers des fonctions
> serverless Vercel est en lecture seule et éphémère — une écriture y serait
> perdue. Le commit Git est donc la persistance.

### Flux production

```
Commercial → /admin (édite) → commit cases.json sur GitHub (API)
          → Vercel rebuild auto → site statique à jour (~1 min)
```

---

## Pourquoi un commit par sauvegarde — et quand en changer

**Décision (03/06/2026)** : chaque sauvegarde dans le back-office génère un commit
`chore(admin): mise à jour des réalisations` sur `main`. C'est **assumé**, pas un
défaut.

### Le raisonnement

L'architecture a été dimensionnée sur une hypothèse explicite : **éditions rares
(quelques fois par mois)**. Sous cette hypothèse, le commit-par-sauvegarde est le
**meilleur compromis** :
- pas d'infrastructure supplémentaire (la donnée vit dans le repo, versionnée) ;
- versioning, historique et rollback du contenu **gratuits** via Git ;
- modèle 100 % statique conservé (simple, rapide, robuste, sécurisé).

Le coût — quelques dizaines de commits `chore(admin):` par an — est **marginal** et
n'altère pas la lisibilité de l'historique de code, d'autant que ces commits sont
préfixés (convention « changement non structurant ») et donc filtrables :

```bash
# Historique de code uniquement (exclut les commits de contenu back-office)
git log --invert-grep --grep="chore(admin)" --oneline
```

> Re-architecturer maintenant pour éviter ces commits serait de la
> **sur-ingénierie** : on ajouterait de la complexité et du risque pour résoudre un
> problème cosmétique à cette fréquence.

### Le seuil de bascule

On change d'approche **quand le problème devient réel**, pas par anticipation. Si la
fréquence d'édition passe durablement à **plusieurs fois par semaine**, deux options
prennent le relais :

| Option | Principe | Quand la choisir |
|---|---|---|
| **A — Branche `content` dédiée** | Les sauvegardes committent sur une branche `content`, pas `main`. Le build source la donnée depuis cette branche. | On veut garder le versioning Git du contenu, fréquence modérée. |
| **B — Store externe + ISR/SSR** | Le contenu sort de Git (base de données / Vercel KV ou Blob). Les pages lisent le store ; revalidation à la demande (ISR) ou rendu SSR. | Éditions fréquentes, priorité à l'instantanéité ; versioning Git du contenu non requis. |

Tant qu'on reste à « quelques fois par mois », **aucune des deux n'est justifiée** :
le statu quo est le choix optimal.

---

## Configuration Vercel (variables d'environnement)

À définir dans : projet Vercel → **Settings** → **Environment Variables**.

| Nom | Valeur | Rôle |
|---|---|---|
| `GITHUB_TOKEN` | *(le PAT fine-grained)* | Authentifie les commits sur le repo |
| `GITHUB_REPO` | `GregoireMaillard/wivoo-nos-realisations` | Repo cible `owner/repo` |
| `GITHUB_BRANCH` | `main` | Branche cible des commits |
| `ADMIN_PASSWORD` | *(mot de passe partagé)* | Active et protège l'accès à `/admin` (cf. Authentification) |

Sans ces variables, toute sauvegarde en production échouera (message d'erreur
affiché dans l'admin).

---

## Le token GitHub (fine-grained)

### Création (gratuit, ~2 min)
1. GitHub → **Settings** → **Developer settings** → **Personal access tokens**
   → **Fine-grained tokens** → **Generate new token**
2. **Repository access** → *Only select repositories* → `wivoo-nos-realisations`
3. **Permissions** → *Repository permissions* → **Contents : Read and write**
   (seule permission nécessaire)
4. **Expiration** : obligatoire (max 366 jours). **À noter pour renouveler.**
5. Générer → copier le token (affiché une seule fois) → le coller dans
   `GITHUB_TOKEN` côté Vercel.

### ⏰ Renouvellement
Le token a une **date d'expiration obligatoire**. À son échéance, les
sauvegardes en production cesseront de fonctionner (erreur HTTP 401 côté API
GitHub). Penser à régénérer un token et à mettre à jour `GITHUB_TOKEN` dans
Vercel avant la date d'expiration.

**Date d'expiration du token actuel : _(à renseigner)_**

---

## Comportements et limites connus

- **Délai ~1 min** : inhérent au modèle statique. Compromis accepté (édition rare).
  L'admin affiche un message après sauvegarde pour l'expliquer.
- **Liste admin éventuellement en retard** : juste après une sauvegarde, la liste
  `/admin` peut afficher l'ancien état tant que le rebuild Vercel n'est pas fini
  (elle lit le `cases.json` du bundle déployé). Se résorbe au bout de ~1 min.
- **Édition concurrente** : si deux personnes sauvegardent quasi simultanément,
  un retry automatique gère le conflit de SHA. Si le conflit persiste, un message
  invite à recharger et réessayer (aucune donnée écrasée silencieusement).
- **Protection CSRF** : Astro rejette (HTTP 403) les POST sans en-tête `Origin`
  valide (`security.checkOrigin`, activé par défaut). Transparent depuis un
  navigateur ; à connaître si on teste l'admin via `curl` (ajouter
  `-H "Origin: <url>"`).

---

## Fichiers concernés

| Fichier | Rôle |
|---|---|
| `src/lib/cases.ts` | `readCases` / `writeCases` (local vs GitHub) + gestion du conflit |
| `src/pages/admin/index.astro` | Liste, suppression, publication/dépublication, bandeaux de feedback |
| `src/pages/admin/new.astro` | Création d'une réalisation |
| `src/pages/admin/edit/[slug].astro` | Édition d'une réalisation |
