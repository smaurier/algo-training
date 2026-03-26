# Lab 01 — Analyse de complexité

## Objectifs

- Mesurer empiriquement la **complexité temporelle** d'algorithmes concrets
- Comparer les performances de différentes approches pour le même problème
- Comprendre l'impact des **méthodes natives** JavaScript sur la complexité
- Apprendre à utiliser `performance.now()` pour le benchmarking

## Prérequis

- Module 01 (Complexité et raisonnement)
- Node.js 20+ avec TypeScript (npx tsx)

## Lancer l'exercice

```bash
npx tsx exercise.ts
```

## Instructions

### Partie 1 — Prédire et mesurer

Vous trouverez dans `exercise.ts` plusieurs fonctions qui résolvent le même problème (trouver si un tableau contient un doublon) avec des complexités différentes. Pour chaque fonction, **prédisez** la complexité Big-O avant de lancer le benchmark.

### Partie 2 — Piège des méthodes natives

Implémentez la fonction `benchmarkNativeMethods` qui mesure le coût réel de `Array.includes()`, `Array.indexOf()`, `Set.has()` et `Map.has()` sur des tableaux de tailles croissantes. Observez lesquelles sont O(n) et lesquelles sont O(1).

### Partie 3 — Trouver le point de croisement

Implémentez `findCrossoverPoint` : à partir de quelle taille de tableau un algorithme O(n log n) devient-il plus rapide qu'un algorithme O(n²) ? Mesurez empiriquement le point de croisement.

### Partie Bonus — Complexité spatiale

Mesurez la consommation mémoire de différentes structures (Array vs Set vs Map) pour stocker les mêmes données.

## Ce qu'il faut observer

1. Les constantes cachées peuvent rendre un O(n log n) plus lent qu'un O(n²) pour les petits inputs.
2. `Array.includes()` est O(n), `Set.has()` est O(1) — la différence est dramatique pour n > 10 000.
3. Le garbage collector peut perturber les mesures — faites plusieurs itérations.

## Indices

- `performance.now()` donne des timestamps en millisecondes avec précision sub-milliseconde.
- Faites au moins 3 mesures et prenez la médiane pour des résultats stables.
- Pour la mémoire, utilisez `process.memoryUsage().heapUsed` avant et après l'allocation.
