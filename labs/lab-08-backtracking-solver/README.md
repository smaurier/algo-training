# Lab 08 — Backtracking Solver

## Objectifs

- Générer toutes les permutations d'un tableau
- Résoudre le problème des combinaisons avec contrainte de somme
- Implémenter un solveur de Sudoku par backtracking
- Générer toutes les parenthèses valides

## Prérequis

- Module 08 — Backtracking

## Lancer l'exercice

```sh
npx tsx exercise.ts
```

## Instructions

### Partie 1 : Permutations

Implémentez `permutations` qui retourne toutes les permutations d'un tableau de nombres distincts.

### Partie 2 : Combination Sum

Implémentez `combinationSum` qui trouve toutes les combinaisons de `candidates` qui totalisent `target`. Un même candidat peut être réutilisé.

### Partie 3 : Sudoku Solver

Implémentez `solveSudoku` qui résout une grille 9×9 en place. Les cases vides sont représentées par 0.

### Bonus : Parenthèses valides

Implémentez `generateParentheses(n)` qui retourne toutes les combinaisons de n paires de parenthèses bien formées.

## Ce qu'il faut observer

- Le backtracking explore un arbre de décisions et "recule" quand une branche est invalide.
- Le pruning (élagage) est crucial pour les performances — comparez avec et sans.
- Le Sudoku est un excellent exemple de contrainte propagation + backtracking.
- Le pattern `choose → explore → unchoose` est universel.

## Indices

- Permutations : utilisez un tableau `used[]` ou échangez les éléments.
- Combination Sum : triez les candidats et si `sum > target`, coupez la branche.
- Sudoku : pour chaque case vide, essayez 1-9, vérifiez ligne/colonne/bloc 3×3.
- Parenthèses : gardez un compteur d'ouvrantes et fermantes.
