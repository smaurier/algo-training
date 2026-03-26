# Lab 10 — UnionFind et Trie

## Objectifs

- Implémenter Union-Find avec path compression et union by rank
- Utiliser Union-Find pour détecter des composantes connexes
- Implémenter un Trie avec insertion, recherche et autocomplétion
- Construire un index de recherche avec le Trie

## Prérequis

- Module 10 — Greedy, UnionFind, Trie

## Lancer l'exercice

```sh
npx tsx exercise.ts
```

## Instructions

### Partie 1 : UnionFind

Implémentez la classe `UnionFind` avec `find` (path compression), `union` (par rang), `connected` et `components`.

### Partie 2 : Composantes connexes

Utilisez votre UnionFind pour trouver le nombre de composantes connexes dans un graphe non orienté et identifier les groupes.

### Partie 3 : Trie avec autocomplétion

Implémentez un Trie qui supporte `insert`, `search`, `startsWith` et `autocomplete(prefix, limit)`.

### Bonus : Index de recherche

Utilisez le Trie pour indexer des routes d'API et implémenter un routeur avec wildcard matching.

## Ce qu'il faut observer

- Union-Find atteint quasiment O(1) amorti grâce aux deux optimisations.
- Le Trie consomme beaucoup de mémoire mais offre O(L) pour recherche/insertion.
- L'autocomplétion est un DFS à partir du nœud préfixe.

## Indices

- Find : remonter jusqu'à la racine, puis écraser le parent de chaque nœud visité.
- Union by rank : toujours attacher le plus petit arbre sous le plus grand.
- Trie : chaque nœud a un `Map<string, TrieNode>` pour ses enfants.
- Autocomplete : DFS depuis le nœud du préfixe, collectez les mots complets.
