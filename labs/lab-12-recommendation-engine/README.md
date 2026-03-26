# Lab 12 — Moteur de recommandation (Projet final)

## Objectifs

- Intégrer les structures de données vues durant tout le cours
- Construire un index de produits avec Trie
- Calculer la similarité et scorer les recommandations
- Assembler le tout en une API cohérente avec cache LRU

## Prérequis

- Tous les modules précédents (00—11)

## Lancer l'exercice

```sh
npx tsx exercise.ts
```

## Instructions

### Partie 1 : ProductIndex avec Trie

Implémentez un index qui supporte la recherche par préfixe et par tag.

### Partie 2 : Graphe de similarité

Construisez un graphe pondéré de similarité entre produits basé sur les tags communs.

### Partie 3 : Moteur de recommandation

Assemblez l'index, le graphe et un cache LRU pour créer un moteur complet qui, étant donné un produit, retourne les K meilleurs recommandations triées par score.

### Bonus : Pagination des résultats

Ajoutez une cursor pagination au moteur pour supporter les résultats paginés.

## Ce qu'il faut observer

- Chaque composant utilise une structure de données différente (Trie, Graph, Heap, Cache).
- Le scoring combine plusieurs facteurs (similarité + popularité + prix).
- Le cache évite de recalculer les recommandations fréquentes.
- Ce pattern se retrouve dans tous les systèmes de recommandation réels.

## Indices

- Similarité = nombre de tags communs / nombre total de tags distincts (Jaccard).
- Utilisez un MinHeap pour extraire les Top-K efficacement.
- Le cache devrait stocker les résultats par productId avec un TTL raisonnable.
