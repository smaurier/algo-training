# Lab 07 — Graphes et dépendances

## Objectifs

- Construire un graphe de dépendances à partir d'une liste d'adjacence
- Implémenter un tri topologique (Kahn's algorithm)
- Détecter les cycles dans un graphe orienté
- Trouver le plus court chemin (BFS non pondéré)

## Prérequis

- Module 07 — Graphes et parcours

## Lancer l'exercice

```sh
npx tsx exercise.ts
```

## Instructions

### Partie 1 : Graphe de dépendances

Modélisez un graphe orienté `Map<string, string[]>` à partir d'une liste de dépendances de type `[tâche, dépendance]`. Implémentez également le calcul du degré entrant.

### Partie 2 : Tri topologique (Kahn)

Implémentez l'algorithme de Kahn pour déterminer un ordre de build valide. Si un cycle est détecté (pas tous les nœuds traités), retournez `null`.

### Partie 3 : Détection de cycles (DFS 3 couleurs)

Implémentez la détection de cycles avec le marquage WHITE/GRAY/BLACK.

### Bonus : Plus court chemin BFS

Implémentez `shortestPath` qui retourne le chemin le plus court entre deux nœuds dans un graphe non pondéré.

## Ce qu'il faut observer

- L'ordre topologique n'est pas unique — plusieurs ordres valides existent.
- Kahn détecte les cycles automatiquement (nœuds restants non traités).
- La détection 3 couleurs est la méthode standard pour les graphes orientés.
- BFS garantit le plus court chemin en nombre d'arêtes.

## Indices

- Pour Kahn : démarrer par les nœuds de degré 0, les retirer et décrémenter les voisins.
- Pour 3 couleurs : GRAY = en cours de visite (chemin actuel). Si on visite un GRAY → cycle.
- Pour BFS shortest path : stocker le parent de chaque nœud visité, puis reconstruire le chemin.
