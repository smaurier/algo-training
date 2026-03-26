# Lab 02 — Tableaux et HashMaps

## Objectifs

- Implémenter les patterns **counting**, **groupBy**, **two-pointer** et **sliding window**
- Résoudre des problèmes concrets avec `Map` et `Set`
- Manipuler des chaînes de caractères efficacement

## Prérequis

- Module 02 (Tableaux, chaînes, hash maps)
- Node.js 20+

## Lancer l'exercice

```bash
npx tsx exercise.ts
```

## Instructions

### Partie 1 — Two Sum avec HashMap

Implémentez `twoSum(nums, target)` qui retourne les indices des deux éléments dont la somme est égale à `target`. Vous devez atteindre O(n).

### Partie 2 — GroupBy générique

Implémentez `groupBy(items, keyFn)` qui groupe les éléments d'un tableau par clé. Testez-le sur des données réalistes (utilisateurs par rôle, commandes par statut).

### Partie 3 — Anagrammes

Implémentez `groupAnagrams(words)` qui groupe les mots qui sont des anagrammes les uns des autres. Utilisez une clé de tri.

### Partie Bonus — Sliding Window

Implémentez `maxSumSubarray(nums, k)` qui trouve le sous-tableau de taille k avec la somme maximale. Complexité cible : O(n).

## Indices

- Two Sum : parcourez le tableau une seule fois, en stockant `complement = target - num` dans une Map.
- GroupBy : `Map.get` + `Map.set` avec un tableau par clé.
- Anagrammes : triez les lettres de chaque mot pour obtenir une clé canonique.
