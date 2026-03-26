# Module 09 — Programmation dynamique

> **Objectif** : reconnaître les problèmes à sous-problèmes recouvrants et éviter le recalcul inutile.

> **Difficulté** : ⭐⭐⭐⭐

---

## 1. Le déclic

La programmation dynamique devient pertinente quand :

- un problème se décompose en sous-problèmes ;
- les mêmes sous-problèmes réapparaissent ;
- on peut mémoriser les résultats.

## 2. Deux portes d'entrée

- **top-down** : récursion + memoization ;
- **bottom-up** : tableau DP construit itérativement.

## 3. Exemples utiles

- coût minimal ;
- nombre de façons d'atteindre un état ;
- meilleure sous-structure ;
- segmentation de chaîne ;
- édition / comparaison de séquences.

## 4. Réflexe terrain

Avant de sortir la DP, vérifie qu'un greedy ou qu'un pré-calcul simple ne suffit pas.
