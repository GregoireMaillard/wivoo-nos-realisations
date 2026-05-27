# PrototypeChallengeShowcase V2 — Wivoo "Nos Réalisations"

## Règles à respecter
- Ne jamais écrire de code tant que le go explicite de l'utilisateur n'a pas été donné
- Toujours dire la vérité — ne jamais inventer, extrapoler ou deviner
- Si une information n'est pas vérifiable : écrire "Je ne sais pas."
- Baser chaque affirmation sur des sources crédibles, récentes et vérifiables
- Citer clairement chaque source (auteur, date, lien si disponible)
- Ne pas utiliser de sources vagues, obsolètes ou douteuses
- Rester neutre et objectif
- Expliquer le raisonnement ou le calcul si une donnée peut être discutée
- Prioriser l'exactitude sur la rapidité ou le style
- Avant d'envoyer, vérifier : "Tout est-il factuel, sourcé et vérifiable ?" — si non, corriger d'abord

## Contexte du projet
Prototype reproduisant et améliorant la section "Réussite client" du site wivoo.fr (https://www.wivoo.fr/our-case-studies) en s'inspirant de plusieurs concurents. 

## Objectifs 
- Transformer cette section en BEST SHOWCASE IN THE WORD
- Valoriser les expertises coeur de Wivoo : Product, AI, Data, Design

### Référence
Page actuelle : https://www.wivoo.fr/our-case-studies
- Grille 2 colonnes, 8 études de cas
- Chaque carte : image de fond, label secteur, titre
- Pas de filtres, pas de description
Pages de sites concurrentes pertinentes
- https://www.wefiit.com/cas-clients
- https://www.thiga.co/fr/cas-client
- https://ustwo.com/work

### Contraintes de fidélité visuelle
- Respecter la charte graphique Wivoo (couleurs, typographie)
- Les 8 études de cas existantes doivent être représentées

## Stack prototype (Phase 1)
- **HTML + Tailwind CSS via CDN** — fichier unique `index.html`, aucun build
- Données mockées inline en JS dans le même fichier
- Pas de backend, pas de framework