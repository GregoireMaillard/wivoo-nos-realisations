# Back-office — Note d'exploitation

Documentation du fonctionnement et de la configuration du back-office de gestion
des réalisations (`/admin`).

## ⚠️ TODO sécurité — à traiter avant toute exposition réelle

**Le back-office `/admin` n'a actuellement AUCUNE authentification.** N'importe qui
connaissant l'URL peut créer, modifier ou supprimer des réalisations (et donc
committer sur le repo GitHub).

C'est un choix assumé pour la phase de démo (URL non communiquée). **Une
authentification doit être ajoutée avant** :
- de communiquer le lien `/admin` à des utilisateurs,
- toute exposition publique / indexation,
- la mise en production "réelle".

Piste prévue : middleware Astro (`src/middleware.ts`) protégeant `/admin*` avec
un mot de passe partagé (variable d'env `ADMIN_PASSWORD`) + cookie de session.

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

## Configuration Vercel (variables d'environnement)

À définir dans : projet Vercel → **Settings** → **Environment Variables**.

| Nom | Valeur | Rôle |
|---|---|---|
| `GITHUB_TOKEN` | *(le PAT fine-grained)* | Authentifie les commits sur le repo |
| `GITHUB_REPO` | `GregoireMaillard/wivoo-nos-realisations` | Repo cible `owner/repo` |
| `GITHUB_BRANCH` | `main` | Branche cible des commits |

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
