# Lab 04 — Récursion et recherche binaire

## Objectifs
- Implémenter merge sort et vérifier son fonctionnement sur des données complexes
- Maîtriser binary search et ses variantes (lower bound, upper bound)
- Appliquer "binary search the answer" à un problème concret

## Prérequis
- Module 04 (Récursion, divide & conquer, binary search)

## Lancer l'exercice
```bash
npx tsx exercise.ts
```

## Instructions

### Partie 1 — Merge Sort sur des objets
Implémentez `mergeSort(items, compareFn)` générique qui trie un tableau d'objets avec une fonction de comparaison custom.

### Partie 2 — Binary Search avancé
Implémentez `lowerBound(arr, target)` et `upperBound(arr, target)` pour trouver les bornes d'un intervalle de valeurs dans un tableau trié.

### Partie 3 — Binary Search the Answer
Résolvez : étant donné un tableau de poids de colis et un nombre de jours, trouvez la capacité minimale d'un bateau pour livrer tous les colis.

### Partie Bonus — Flatten un objet JSON imbriqué
Utilisez la récursion pour "aplatir" un objet JSON profondément imbriqué.
