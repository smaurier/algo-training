# Glossaire — Algorithmie

## Complexité

- **Big-O** : borne supérieure asymptotique du coût d'un algorithme.
- **Complexité amortie** : coût moyen sur une séquence d'opérations.
- **Trade-off temps / mémoire** : gagner en vitesse en stockant davantage, ou l'inverse.

## Structures

- **Hash map** : table clé → valeur avec accès moyen en $O(1)$.
- **Heap** : arbre presque complet utilisé pour maintenir un min ou max courant.
- **Trie** : arbre de préfixes utile pour l'autocomplétion et la recherche textuelle.
- **Union-Find** : structure pour gérer des groupes disjoints et les fusionner vite.

## Parcours

- **BFS** : parcours en largeur, idéal pour les distances minimales en graphe non pondéré.
- **DFS** : parcours en profondeur, utile pour explorer, détecter des cycles, faire du backtracking.
- **Topological sort** : ordre compatible avec des dépendances dans un DAG.

## Optimisation

- **Memoization** : mise en cache des résultats d'une fonction pure.
- **Dynamic programming** : résolution d'un problème via sous-problèmes recouvrants.
- **Greedy** : stratégie locale supposée suffisante pour atteindre un bon résultat global.

## Patterns terrain

- **Sliding window** : fenêtre mobile pour des sous-tableaux / sous-chaînes.
- **Two pointers** : deux index qui avancent selon une condition.
- **Prefix sum** : somme cumulée pour répondre rapidement à des requêtes de plage.
