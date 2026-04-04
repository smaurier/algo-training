# Lab 11 — Patterns Fullstack

## Objectifs

- Implémenter debounce et throttle
- Construire un LRU Cache avec TTL
- Développer un rate limiter (token bucket)
- Mettre en place une cursor pagination
- Réviser generators et URLSearchParams dans un contexte fullstack

## Prérequis

- Module 11 — Patterns JS Fullstack

## Lancer l'exercice

```sh
npx tsx exercise.ts
```

## Instructions

### Partie 1 : Debounce & Throttle

Implémentez `debounce` et `throttle` avec les bons comportements temporels.

### Partie 2 : LRU Cache avec TTL

Implémentez un `LRUCache<K, V>` qui :

- Expire les entrées après un TTL configurable
- Éjecte l'entrée la moins récemment utilisée quand la capacité est atteinte

### Partie 3 : Token Bucket Rate Limiter

Implémentez un `TokenBucket` qui contrôle le débit de requêtes.

### Bonus : Cursor Pagination

Implémentez `paginateCursor` qui pagine un dataset en utilisant un curseur opaque (encodé en base64).

## Ce qu'il faut observer

- Debounce regroupe les appels rapides, throttle limite le débit maximal.
- Le LRU cache combine une Map (ordre d'insertion) et la logique d'expiration.
- Le token bucket est le rate limiter le plus courant dans les API.
- La cursor pagination est plus stable que offset/limit face aux insertions/suppressions.
- Un generator permet de produire un flux d'ids sans allouer un tableau intermédiaire.
- URLSearchParams est l'outil natif le plus fiable pour construire des query strings.

## Indices

- Debounce : clearTimeout + setTimeout à chaque appel.
- Throttle : bloquer les appels pendant un intervalle.
- LRU avec Map JS : `delete` + `set` pour déplacer en fin (le plus récent).
- Token bucket : remplir les tokens basé sur le temps écoulé depuis le dernier accès.
- Generator : `function*` + `yield` pour produire les valeurs une par une.
- Query string : ajoutez uniquement les filtres définis via `URLSearchParams`.
