# Module 04 — Récursion, divide & conquer, recherche dichotomique

> **Objectif** : apprendre à découper un problème en sous-problèmes et à exploiter l'ordre pour aller plus vite.

> **Difficulté** : ⭐⭐⭐

---

## 1. La récursion

Une solution récursive repose sur :

- un **cas de base** ;
- une **réduction** vers un problème plus petit ;
- une garantie d'arrêt.

La récursion est naturelle pour les arbres, les combinaisons, les parsers, et certains algorithmes de division.

## 2. Divide & conquer

Le principe : découper, résoudre chaque morceau, recombiner.

Exemples : merge sort, quick sort, binary search.

## 3. Binary search

La dichotomie n'est pas limitée à “chercher dans un tableau trié”. C'est un pattern pour chercher **une frontière** : première valeur valide, capacité minimale, seuil de temps, etc.

## 4. Pièges

- conditions de boucle incorrectes ;
- off-by-one ;
- mauvais invariant ;
- récursion trop profonde quand une boucle serait plus sûre.
