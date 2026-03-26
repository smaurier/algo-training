# Glossaire — Algorithmie

## Complexité

- **Big-O** : borne supérieure asymptotique du coût d'un algorithme — décrit le pire cas.
- **Big-Ω (Omega)** : borne inférieure asymptotique — décrit le meilleur cas.
- **Big-Θ (Theta)** : borne exacte lorsque le meilleur et le pire cas coïncident.
- **Complexité amortie** : coût moyen sur une séquence d'opérations (ex. `push` sur un tableau dynamique).
- **Trade-off temps / mémoire** : gagner en vitesse en stockant davantage, ou l'inverse.
- **Complexité spatiale** : quantité de mémoire additionnelle requise par l'algorithme.

## Structures de données

- **Array (tableau)** : collection à accès indexé en $O(1)$, insertion/suppression en $O(n)$.
- **Hash map / Map** : table clé → valeur avec accès moyen en $O(1)$, basée sur une fonction de hachage.
- **Set** : collection de valeurs uniques, test de présence en $O(1)$.
- **Stack (pile)** : structure LIFO — `push` et `pop` en $O(1)$.
- **Queue (file)** : structure FIFO — `enqueue` et `dequeue` en $O(1)$.
- **Linked list** : suite de nœuds chaînés, insertion/suppression en $O(1)$ si on a la référence.
- **Heap (tas)** : arbre binaire presque complet pour maintenir un min ou max courant en $O(\log n)$.
- **BST (arbre binaire de recherche)** : arbre où chaque nœud est > fils gauche et < fils droit.
- **Trie (arbre de préfixes)** : arbre pour l'autocomplétion et la recherche textuelle, $O(L)$ par opération.
- **Union-Find (Disjoint Set)** : structure pour gérer des groupes disjoints avec union par rang et compression de chemin, quasi $O(1)$ amorti.
- **LRU Cache** : cache à éviction du moins récemment utilisé, via `Map` ordonnée.

## Algorithmes de tri

- **Bubble sort** : tri par échanges successifs — $O(n^2)$, stable.
- **Merge sort** : diviser pour régner, fusion de sous-tableaux — $O(n \log n)$, stable.
- **Quick sort** : partition autour d'un pivot — $O(n \log n)$ moyen, en place.
- **Heap sort** : tri par extraction du max d'un heap — $O(n \log n)$, en place, non stable.
- **Tri stable** : un tri qui conserve l'ordre relatif des éléments jugés égaux.

## Techniques de parcours

- **BFS (Breadth-First Search)** : parcours en largeur via une file, idéal pour les distances minimales.
- **DFS (Depth-First Search)** : parcours en profondeur via pile/récursion, pour explorer, détecter des cycles, backtracking.
- **In-order** : parcours DFS d'un arbre (gauche → nœud → droit) — donne les valeurs triées dans un BST.
- **Pre-order** : parcours DFS (nœud → gauche → droit) — utile pour sérialiser un arbre.
- **Post-order** : parcours DFS (gauche → droit → nœud) — utile pour libérer la mémoire ou évaluer des expressions.
- **Topological sort** : ordre linéaire compatible avec les dépendances dans un DAG.

## Recherche

- **Binary search** : recherche dichotomique dans un tableau trié — $O(\log n)$.
- **Lower bound** : plus petit index où `arr[i] >= cible`.
- **Upper bound** : plus petit index où `arr[i] > cible`.

## Stratégies de résolution

- **Divide & conquer** : diviser le problème, résoudre chaque partie, combiner.
- **Backtracking** : exploration exhaustive avec élagage (choose → explore → unchoose).
- **Memoization** : mise en cache des résultats d'une fonction pure (top-down DP).
- **Dynamic programming** : résolution via sous-problèmes recouvrants et sous-structure optimale.
- **Greedy (glouton)** : stratégie locale à chaque étape, supposée suffisante pour l'optimal global.
- **Récursion** : fonction qui s'appelle elle-même avec un cas de base pour terminer.

## Patterns de programmation

- **Sliding window** : fenêtre mobile pour des sous-tableaux / sous-chaînes contigus.
- **Two pointers** : deux index avancent selon une condition (convergent ou co-directionnels).
- **Prefix sum** : somme cumulée pour répondre en $O(1)$ à des requêtes de plage.
- **Monotonic stack** : pile dont les éléments restent triés, pour le « next greater element ».
- **Counting / frequency map** : map de fréquences pour compter les occurrences.

## Graphes

- **Adjacency list** : représentation d'un graphe par `Map<Node, Node[]>` — $O(V + E)$ en mémoire.
- **Adjacency matrix** : matrice $V \times V$ — $O(V^2)$ en mémoire, lookup en $O(1)$.
- **DAG** : Directed Acyclic Graph — graphe orienté sans cycle.
- **Cycle detection (3-color)** : détection de cycle par coloration WHITE/GRAY/BLACK en DFS.
- **Dijkstra** : plus court chemin dans un graphe pondéré positif via min-heap.
- **Kruskal** : arbre couvrant minimal avec Union-Find et arêtes triées par poids.

## Patterns terrain (fullstack)

- **Debounce** : retarder l'exécution tant que les événements continuent d'arriver.
- **Throttle** : limiter l'exécution à au plus une fois par intervalle.
- **Token bucket** : algorithme de rate limiting — jetons se remplissent à un rythme fixe.
- **Cursor pagination** : pagination basée sur un curseur opaque plutôt qu'un offset.
- **Consistent hashing** : distribution de clés sur un anneau pour le sharding / load balancing.
