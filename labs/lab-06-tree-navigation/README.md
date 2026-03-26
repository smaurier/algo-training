# Lab 06 — Navigation dans les arbres

## Objectifs

- Implémenter un arbre binaire et ses parcours DFS (in/pre/post-order)
- Parcourir un arbre par niveaux (BFS)
- Convertir un tableau plat `{ id, parentId }` en arbre
- Trouver le plus petit ancêtre commun (LCA)

## Prérequis

- Module 06 — Arbres et BST

## Lancer l'exercice

```sh
npx tsx exercise.ts
```

## Instructions

### Partie 1 : Parcours DFS (in/pre/post-order)

Implémentez les trois fonctions `inOrder`, `preOrder` et `postOrder` qui retournent les valeurs d'un BST dans l'ordre correspondant.

### Partie 2 : BFS par niveaux

Implémentez `levelOrder` qui retourne un tableau de tableaux — chaque sous-tableau contenant les valeurs d'un même niveau.

### Partie 3 : Flat → Tree

Implémentez `buildTree` qui convertit un tableau plat de `{ id, name, parentId }` en arbre hiérarchique.

### Bonus : LCA (Lowest Common Ancestor)

Implémentez `findLCA` qui retourne le plus petit ancêtre commun de deux nœuds dans un BST en exploitant la propriété BST.

## Ce qu'il faut observer

- Les trois ordres DFS produisent des résultats très différents sur le même arbre.
- BFS utilise une queue tandis que DFS utilise la pile d'appels.
- Le pattern flat→tree est essentiel pour les menus, catégories, commentaires imbriqués.
- Le LCA exploite la propriété BST pour éviter un parcours complet.

## Indices

- Pour BFS, utilisez un tableau comme queue (shift + push) ou mieux, un index curseur.
- Pour flat→tree, faites un premier passage Map<id, node>, puis un second passage pour attacher les enfants.
- Pour LCA dans un BST : si les deux valeurs sont < node, aller à gauche ; si > node, aller à droite ; sinon c'est le LCA.
