# Module 08 — Backtracking et recherche exhaustive

> **Objectif** : apprendre à explorer un espace de solutions, puis à couper tôt les branches inutiles.

> **Difficulté** : ⭐⭐⭐⭐

---

## 1. Le schéma

Le backtracking consiste à :

1. construire une solution partielle ;
2. vérifier si elle reste valide ;
3. continuer ou revenir en arrière.

## 2. Cas typiques

- permutations ;
- combinaisons ;
- emploi du temps ;
- placement sous contraintes ;
- recherche de chemin dans une grille.

## 3. La compétence importante : élaguer

Le but n'est pas d'explorer bêtement, mais de **réduire l'espace de recherche** avec des contraintes rapides à vérifier.

## 4. Cas terrain

- génération de variantes ;
- filtres combinatoires ;
- règles métier contradictoires ;
- allocation de créneaux.
