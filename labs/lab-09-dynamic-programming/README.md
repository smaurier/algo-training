# Lab 09 — Programmation dynamique

## Objectifs

- Implémenter coin change (minimum de pièces)
- Résoudre le problème du sac à dos 0/1
- Calculer la plus longue sous-séquence commune (LCS)
- Compter les chemins dans une grille avec obstacles

## Prérequis

- Module 09 — Programmation dynamique

## Lancer l'exercice

```sh
npx tsx exercise.ts
```

## Instructions

### Partie 1 : Coin Change

Implémentez `coinChange` (tabulation bottom-up) qui retourne le nombre minimum de pièces pour atteindre un montant. Retournez -1 si impossible.

### Partie 2 : Knapsack 0/1

Implémentez `knapsack` qui retourne la valeur maximale et les items choisis, étant donné une capacité et des items avec poids et valeur.

### Partie 3 : LCS (Longest Common Subsequence)

Implémentez `lcs` qui retourne la plus longue sous-séquence commune de deux chaînes, avec reconstruction de la séquence.

### Bonus : Chemins dans une grille avec obstacles

Implémentez `uniquePaths` qui compte les chemins possibles du coin supérieur gauche au coin inférieur droit, en évitant les obstacles (cellules à 1).

## Ce qu'il faut observer

- La tabulation bottom-up évite la récursion et le risque de stack overflow.
- La reconstruction du résultat (quels items, quelle séquence) demande un second parcours.
- Coin change et knapsack ont la même structure DP mais des récurrences différentes.
- L'optimisation d'espace (tableau 1D au lieu de 2D) est possible pour la plupart des DP.

## Indices

- Coin Change : `dp[i] = min coins pour montant i`. `dp[0] = 0`. Pour chaque pièce : `dp[i] = min(dp[i], dp[i-coin] + 1)`.
- Knapsack : `dp[i][w]` = meilleure valeur avec les i premiers items et capacité w.
- LCS : `dp[i][j]` = longueur LCS de s1[0..i] et s2[0..j]. Si match : `dp[i-1][j-1]+1`, sinon `max(dp[i-1][j], dp[i][j-1])`.
- Grille : `dp[r][c] = dp[r-1][c] + dp[r][c-1]`, sauf sur les obstacles.
