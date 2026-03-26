# Module 07 — Graphes et parcours

> **Objectif** : comprendre les graphes orientés et non orientés, implémenter BFS et DFS sur graphe, détecter les cycles, effectuer un tri topologique, et appliquer Dijkstra pour les plus courts chemins.

> **Difficulté** : ⭐⭐⭐⭐

::: info Pas de panique !
Les graphes semblent abstraits, mais tu en utilises tous les jours : dépendances npm, routes de navigation, graphes sociaux, schemas de base de données, pipelines CI/CD. Ce module te donne les outils pour les modéliser et les parcourir.
:::

---

## Prérequis

- Module 03 (queue pour BFS, stack pour DFS)
- Module 05 (MinHeap pour Dijkstra)
- Module 06 (vocabulaire arborescent — un arbre est un graphe sans cycle)

---

## 1. Qu'est-ce qu'un graphe ?

```
Un graphe G = (V, E) est un ensemble de :
- V : sommets (vertices / nodes)
- E : arêtes (edges) reliant des paires de sommets

Types :
- Non orienté (undirected) : A—B signifie qu'on peut aller de A→B et de B→A
- Orienté (directed / digraph) : A→B ne signifie PAS B→A
- Pondéré (weighted) : chaque arête a un coût/poids
- Non pondéré : toutes les arêtes ont le même coût (1)

Exemples :
- Social : amis (non orienté), followers (orienté)
- Routes : villes reliées par des routes (pondéré par distance)
- Dépendances : npm packages (orienté acyclique — DAG)
- Permissions : héritage de rôles (orienté)
```

---

## 2. Représentations en mémoire

### 2.1 Liste d'adjacence (la plus courante en JS)

```typescript
// Map<noeud, voisins>
type Graph<T> = Map<T, T[]>;

function createGraph<T>(): Graph<T> {
  return new Map();
}

function addVertex<T>(graph: Graph<T>, vertex: T): void {
  if (!graph.has(vertex)) graph.set(vertex, []);
}

function addEdge<T>(graph: Graph<T>, from: T, to: T, directed = false): void {
  addVertex(graph, from);
  addVertex(graph, to);
  graph.get(from)!.push(to);
  if (!directed) graph.get(to)!.push(from);
}

// Construction
const g = createGraph<string>();
addEdge(g, 'A', 'B');
addEdge(g, 'A', 'C');
addEdge(g, 'B', 'D');
addEdge(g, 'C', 'D');
addEdge(g, 'D', 'E');

console.log(g);
// Map {
//   'A' => ['B', 'C'],
//   'B' => ['A', 'D'],
//   'C' => ['A', 'D'],
//   'D' => ['B', 'C', 'E'],
//   'E' => ['D']
// }
```

### 2.2 Matrice d'adjacence

```typescript
// Utile quand le graphe est dense (beaucoup d'arêtes)
// matrix[i][j] = 1 si arête de i vers j, 0 sinon

function adjacencyMatrix(vertices: string[], edges: [string, string][]): number[][] {
  const index = new Map(vertices.map((v, i) => [v, i]));
  const matrix = Array.from({ length: vertices.length },
    () => new Array(vertices.length).fill(0),
  );

  for (const [from, to] of edges) {
    matrix[index.get(from)!][index.get(to)!] = 1;
    matrix[index.get(to)!][index.get(from)!] = 1; // non orienté
  }

  return matrix;
}

//     A  B  C  D  E
// A [ 0, 1, 1, 0, 0 ]
// B [ 1, 0, 0, 1, 0 ]
// C [ 1, 0, 0, 1, 0 ]
// D [ 0, 1, 1, 0, 1 ]
// E [ 0, 0, 0, 1, 0 ]
```

### 2.3 Quand utiliser quoi ?

```
┌──────────────────────┬──────────────────┬──────────────────────┐
│  Critère             │  Liste d'adj.    │  Matrice d'adj.      │
├──────────────────────┼──────────────────┼──────────────────────┤
│  Espace              │  O(V + E)        │  O(V²)               │
│  Ajouter un sommet   │  O(1)            │  O(V²) recréer       │
│  Ajouter une arête   │  O(1)            │  O(1)                │
│  Vérifier une arête  │  O(deg)          │  O(1)                │
│  Lister les voisins  │  O(deg)          │  O(V)                │
│  Graphe creux        │  ✅ Idéal        │  ❌ Gaspillage       │
│  Graphe dense        │  ❌ Lent voisins │  ✅ Idéal            │
│  JavaScript typique  │  ✅ Map + Array  │  Rarement utilisé    │
└──────────────────────┴──────────────────┴──────────────────────┘
```

> 💡 En JavaScript, utilise presque toujours la **liste d'adjacence** (Map). Les graphes web sont typiquement creux.

---

## 3. BFS sur graphe

```typescript
// BFS = parcours en largeur = explorer les voisins niveau par niveau
// Complexité : O(V + E)
// Utilisation : plus court chemin non pondéré, composantes connexes, distance

function bfs<T>(graph: Graph<T>, start: T): T[] {
  const visited = new Set<T>();
  const result: T[] = [];
  const queue: T[] = [start];
  visited.add(start);

  while (queue.length > 0) {
    const vertex = queue.shift()!;
    result.push(vertex);

    for (const neighbor of graph.get(vertex) ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return result;
}

console.log(bfs(g, 'A')); // ['A', 'B', 'C', 'D', 'E']
```

### 3.1 BFS — Plus court chemin (non pondéré)

```typescript
function shortestPath<T>(graph: Graph<T>, start: T, end: T): T[] | null {
  if (start === end) return [start];

  const visited = new Set<T>([start]);
  const queue: T[] = [start];
  const parent = new Map<T, T>();

  while (queue.length > 0) {
    const vertex = queue.shift()!;

    for (const neighbor of graph.get(vertex) ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        parent.set(neighbor, vertex);

        if (neighbor === end) {
          // Reconstituer le chemin
          const path: T[] = [end];
          let current = end;
          while (current !== start) {
            current = parent.get(current)!;
            path.unshift(current);
          }
          return path;
        }

        queue.push(neighbor);
      }
    }
  }

  return null; // Pas de chemin
}

console.log(shortestPath(g, 'A', 'E')); // ['A', 'B', 'D', 'E'] ou ['A', 'C', 'D', 'E']
```

---

## 4. DFS sur graphe

```typescript
// DFS = parcours en profondeur = aller le plus loin possible avant de revenir
// Complexité : O(V + E)
// Utilisation : détection de cycle, tri topologique, composantes connexes

// Version itérative (stack)
function dfs<T>(graph: Graph<T>, start: T): T[] {
  const visited = new Set<T>();
  const result: T[] = [];
  const stack: T[] = [start];

  while (stack.length > 0) {
    const vertex = stack.pop()!;
    if (visited.has(vertex)) continue;

    visited.add(vertex);
    result.push(vertex);

    // Empiler les voisins en ordre inverse pour un parcours naturel
    const neighbors = graph.get(vertex) ?? [];
    for (let i = neighbors.length - 1; i >= 0; i--) {
      if (!visited.has(neighbors[i])) {
        stack.push(neighbors[i]);
      }
    }
  }

  return result;
}

// Version récursive
function dfsRecursive<T>(graph: Graph<T>, start: T): T[] {
  const visited = new Set<T>();
  const result: T[] = [];

  function explore(vertex: T) {
    visited.add(vertex);
    result.push(vertex);
    for (const neighbor of graph.get(vertex) ?? []) {
      if (!visited.has(neighbor)) {
        explore(neighbor);
      }
    }
  }

  explore(start);
  return result;
}

console.log(dfs(g, 'A'));
console.log(dfsRecursive(g, 'A'));
```

---

## 5. Composantes connexes

```typescript
// Trouver tous les groupes connectés dans un graphe non orienté

function connectedComponents<T>(graph: Graph<T>): T[][] {
  const visited = new Set<T>();
  const components: T[][] = [];

  for (const vertex of graph.keys()) {
    if (!visited.has(vertex)) {
      const component: T[] = [];
      const queue: T[] = [vertex];
      visited.add(vertex);

      while (queue.length > 0) {
        const v = queue.shift()!;
        component.push(v);
        for (const neighbor of graph.get(v) ?? []) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }

      components.push(component);
    }
  }

  return components;
}

// Exemple : graphe déconnecté
const g2 = createGraph<number>();
addEdge(g2, 1, 2);
addEdge(g2, 2, 3);
addEdge(g2, 4, 5); // composante séparée
addVertex(g2, 6);  // nœud isolé

console.log(connectedComponents(g2));
// [[1, 2, 3], [4, 5], [6]]
```

---

## 6. Détection de cycles

### 6.1 Graphe non orienté

```typescript
function hasCycleUndirected<T>(graph: Graph<T>): boolean {
  const visited = new Set<T>();

  function dfs(vertex: T, parent: T | null): boolean {
    visited.add(vertex);

    for (const neighbor of graph.get(vertex) ?? []) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor, vertex)) return true;
      } else if (neighbor !== parent) {
        return true; // Cycle détecté ! On a trouvé un nœud visité qui n'est pas le parent
      }
    }

    return false;
  }

  for (const vertex of graph.keys()) {
    if (!visited.has(vertex)) {
      if (dfs(vertex, null)) return true;
    }
  }

  return false;
}
```

### 6.2 Graphe orienté (trois couleurs)

```typescript
// BLANC = non visité, GRIS = en cours d'exploration, NOIR = terminé
// Un cycle existe si on rencontre un nœud GRIS pendant l'exploration

function hasCycleDirected<T>(graph: Graph<T>): boolean {
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map<T, number>();

  for (const v of graph.keys()) color.set(v, WHITE);

  function dfs(vertex: T): boolean {
    color.set(vertex, GRAY);

    for (const neighbor of graph.get(vertex) ?? []) {
      const c = color.get(neighbor);
      if (c === GRAY) return true;   // ← Cycle !
      if (c === WHITE && dfs(neighbor)) return true;
    }

    color.set(vertex, BLACK);
    return false;
  }

  for (const vertex of graph.keys()) {
    if (color.get(vertex) === WHITE) {
      if (dfs(vertex)) return true;
    }
  }

  return false;
}
```

---

## 7. Tri topologique (DAG)

```typescript
// Applicable UNIQUEMENT sur un graphe orienté ACYCLIQUE (DAG)
// Résultat : un ordre linéaire tel que si A→B, alors A apparaît avant B
// Utilisation : ordre de compilation, dépendances npm, pipeline de tâches

function topologicalSort<T>(graph: Graph<T>): T[] {
  const visited = new Set<T>();
  const result: T[] = [];

  function dfs(vertex: T) {
    visited.add(vertex);
    for (const neighbor of graph.get(vertex) ?? []) {
      if (!visited.has(neighbor)) {
        dfs(neighbor);
      }
    }
    result.unshift(vertex); // Ajouter APRÈS avoir exploré tous les descendants
  }

  for (const vertex of graph.keys()) {
    if (!visited.has(vertex)) {
      dfs(vertex);
    }
  }

  return result;
}

// Exemple : dépendances de tâches
const tasks = createGraph<string>();
addEdge(tasks, 'install', 'build', true);      // orienté
addEdge(tasks, 'install', 'lint', true);
addEdge(tasks, 'build', 'test', true);
addEdge(tasks, 'lint', 'test', true);
addEdge(tasks, 'test', 'deploy', true);

console.log(topologicalSort(tasks));
// ['install', 'build', 'lint', 'test', 'deploy'] ou autre ordre valide
```

### 7.1 Kahn's Algorithm (BFS topologique)

```typescript
// Alternative BFS avec in-degree — plus facile à comprendre
// Détecte aussi les cycles (si le résultat contient moins de nœuds que le graphe)

function kahnTopologicalSort<T>(graph: Graph<T>): T[] | null {
  const inDegree = new Map<T, number>();

  // Initialiser in-degree à 0
  for (const vertex of graph.keys()) {
    inDegree.set(vertex, 0);
  }

  // Calculer les in-degrees
  for (const [, neighbors] of graph) {
    for (const neighbor of neighbors) {
      inDegree.set(neighbor, (inDegree.get(neighbor) ?? 0) + 1);
    }
  }

  // Trouver les nœuds sans prédécesseur
  const queue: T[] = [];
  for (const [vertex, deg] of inDegree) {
    if (deg === 0) queue.push(vertex);
  }

  const result: T[] = [];

  while (queue.length > 0) {
    const vertex = queue.shift()!;
    result.push(vertex);

    for (const neighbor of graph.get(vertex) ?? []) {
      const newDeg = inDegree.get(neighbor)! - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) queue.push(neighbor);
    }
  }

  // Si le résultat ne contient pas tous les nœuds → cycle
  return result.length === graph.size ? result : null;
}
```

---

## 8. Dijkstra — Plus court chemin pondéré

```typescript
// Graphe pondéré : liste d'adjacence avec poids
type WeightedGraph<T> = Map<T, Array<{ to: T; weight: number }>>;

function addWeightedEdge<T>(
  graph: WeightedGraph<T>,
  from: T, to: T, weight: number,
  directed = false,
) {
  if (!graph.has(from)) graph.set(from, []);
  if (!graph.has(to)) graph.set(to, []);
  graph.get(from)!.push({ to, weight });
  if (!directed) graph.get(to)!.push({ to: from, weight });
}

// Dijkstra avec MinHeap (O((V + E) log V))
// Note : ici on utilise un tableau trié pour simplifier
// En production, utilise le MinHeap du module 05

function dijkstra<T>(
  graph: WeightedGraph<T>,
  start: T,
): { dist: Map<T, number>; prev: Map<T, T | null> } {
  const dist = new Map<T, number>();
  const prev = new Map<T, T | null>();
  const visited = new Set<T>();

  // Initialiser toutes les distances à Infinity
  for (const vertex of graph.keys()) {
    dist.set(vertex, Infinity);
    prev.set(vertex, null);
  }
  dist.set(start, 0);

  // Priority queue simplifiée (tableau trié)
  // Pour un graphe réel, utilise le MinHeap du module 05
  const pq: Array<{ vertex: T; dist: number }> = [{ vertex: start, dist: 0 }];

  while (pq.length > 0) {
    // Extraire le sommet avec la distance minimale
    pq.sort((a, b) => a.dist - b.dist);
    const { vertex } = pq.shift()!;

    if (visited.has(vertex)) continue;
    visited.add(vertex);

    for (const { to, weight } of graph.get(vertex) ?? []) {
      const newDist = dist.get(vertex)! + weight;
      if (newDist < dist.get(to)!) {
        dist.set(to, newDist);
        prev.set(to, vertex);
        pq.push({ vertex: to, dist: newDist });
      }
    }
  }

  return { dist, prev };
}

// Reconstituer le chemin
function reconstructPath<T>(prev: Map<T, T | null>, end: T): T[] {
  const path: T[] = [];
  let current: T | null = end;
  while (current !== null) {
    path.unshift(current);
    current = prev.get(current) ?? null;
  }
  return path;
}

// Exemple
const wg: WeightedGraph<string> = new Map();
addWeightedEdge(wg, 'Paris', 'Lyon', 460);
addWeightedEdge(wg, 'Paris', 'Bordeaux', 580);
addWeightedEdge(wg, 'Lyon', 'Marseille', 315);
addWeightedEdge(wg, 'Bordeaux', 'Marseille', 640);
addWeightedEdge(wg, 'Lyon', 'Toulouse', 540);
addWeightedEdge(wg, 'Bordeaux', 'Toulouse', 240);

const { dist, prev } = dijkstra(wg, 'Paris');
console.log(dist.get('Marseille'));                  // 775 (Paris→Lyon→Marseille)
console.log(reconstructPath(prev, 'Marseille'));     // ['Paris', 'Lyon', 'Marseille']
console.log(dist.get('Toulouse'));                   // 820 (Paris→Bordeaux→Toulouse)
console.log(reconstructPath(prev, 'Toulouse'));      // ['Paris', 'Bordeaux', 'Toulouse']
```

---

## 9. Cas terrain

### 9.1 Graphe de dépendances npm

```typescript
// Vérifier l'ordre d'installation des packages

interface PackageDeps {
  [pkg: string]: string[];
}

function installOrder(deps: PackageDeps): string[] | null {
  const graph = createGraph<string>();

  for (const pkg of Object.keys(deps)) {
    addVertex(graph, pkg);
    for (const dep of deps[pkg]) {
      addEdge(graph, dep, pkg, true); // dep doit être installé avant pkg
    }
  }

  return kahnTopologicalSort(graph);
}

const deps: PackageDeps = {
  'express': [],
  'body-parser': ['express'],
  'cors': ['express'],
  'app': ['body-parser', 'cors'],
  'tests': ['app'],
};

console.log(installOrder(deps));
// ['express', 'body-parser', 'cors', 'app', 'tests']
```

### 9.2 Propagation de permissions

```typescript
// Trouver toutes les permissions héritées d'un rôle via BFS

interface RoleGraph { [role: string]: string[] }

function allPermissions(
  roles: RoleGraph, startRole: string
): string[] {
  const visited = new Set<string>();
  const queue = [startRole];
  visited.add(startRole);

  while (queue.length > 0) {
    const role = queue.shift()!;
    for (const parent of roles[role] ?? []) {
      if (!visited.has(parent)) {
        visited.add(parent);
        queue.push(parent);
      }
    }
  }

  return [...visited];
}

const roleGraph: RoleGraph = {
  'viewer': [],
  'editor': ['viewer'],
  'admin': ['editor'],
  'superadmin': ['admin'],
};

console.log(allPermissions(roleGraph, 'admin'));
// ['admin', 'editor', 'viewer']
```

### 9.3 Détection de dépendance circulaire

```typescript
// Vérifier qu'un graphe de dépendances n'a pas de cycle

function detectCircularDeps(deps: PackageDeps): string[] | null {
  const graph = createGraph<string>();

  for (const pkg of Object.keys(deps)) {
    addVertex(graph, pkg);
    for (const dep of deps[pkg]) {
      addEdge(graph, pkg, dep, true);
    }
  }

  const order = kahnTopologicalSort(graph);
  if (!order) {
    return ['Dépendance circulaire détectée !'];
  }

  return null; // Pas de cycle
}
```

---

## Démonstrations

### Demo 1 — Trouver si un chemin existe entre deux nœuds

```typescript
function hasPath<T>(graph: Graph<T>, start: T, end: T): boolean {
  const visited = new Set<T>();
  const queue = [start];
  visited.add(start);

  while (queue.length > 0) {
    const vertex = queue.shift()!;
    if (vertex === end) return true;
    for (const neighbor of graph.get(vertex) ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return false;
}

console.log(hasPath(g, 'A', 'E')); // true
console.log(hasPath(g, 'A', 'Z')); // false (Z n'existe pas)
```

### Demo 2 — Nombre d'îles (grid as graph)

```typescript
// Classique en entretien : compter les composantes connexes dans une grille

function numIslands(grid: string[][]): number {
  const rows = grid.length;
  const cols = grid[0].length;
  let count = 0;

  function dfs(r: number, c: number) {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return;
    if (grid[r][c] === '0') return;

    grid[r][c] = '0'; // Marquer comme visité
    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') {
        count++;
        dfs(r, c);
      }
    }
  }

  return count;
}

const grid = [
  ['1', '1', '0', '0', '0'],
  ['1', '1', '0', '0', '0'],
  ['0', '0', '1', '0', '0'],
  ['0', '0', '0', '1', '1'],
];

console.log(numIslands(grid)); // 3
```

### Demo 3 — Cloner un graphe

```typescript
function cloneGraph<T>(graph: Graph<T>): Graph<T> {
  const clone: Graph<T> = new Map();
  for (const [vertex, neighbors] of graph) {
    clone.set(vertex, [...neighbors]);
  }
  return clone;
}
```

---

## Points clés

1. **Graphe** = sommets + arêtes. Plus général qu'un arbre (cycles possibles, pas de racine).
2. **Liste d'adjacence** (Map) = la représentation standard en JS pour les graphes creux.
3. **BFS** (queue) = parcours par niveaux, **plus court chemin non pondéré**.
4. **DFS** (stack/récursion) = exploration en profondeur, **détection de cycles**, **tri topologique**.
5. **Composantes connexes** = groupes de nœuds reliés entre eux.
6. **Cycle dirigé** : détection via trois couleurs (blanc/gris/noir).
7. **Tri topologique** : ordre linéaire d'un DAG. Deux méthodes : DFS post-order ou Kahn (BFS).
8. **Dijkstra** : plus court chemin pondéré, O((V + E) log V) avec une priority queue.
9. Toujours utiliser un `Set` de visited pour éviter les boucles infinies.
10. Les grilles 2D sont des graphes implicites (4-8 voisins par cellule).

---

## Pour aller plus loin

- [VisuAlgo — Graph Traversal](https://visualgo.net/en/dfsbfs) — visualisation BFS/DFS
- [VisuAlgo — SSSP](https://visualgo.net/en/sssp) — Dijkstra interactif
- [Wikipedia — Topological sorting](https://en.wikipedia.org/wiki/Topological_sorting) — les deux algorithmes détaillés
- [The Algorithms — TypeScript Graphs](https://the-algorithms.com/category/datastructures?lang=typescript) — implémentations

---

## Si tu es perdu

1. Un graphe = des points reliés par des lignes.
2. BFS = file d'attente, on explore les plus proches d'abord.
3. DFS = pile, on explore en profondeur avant de revenir.
4. Toujours marquer les nœuds visités.
5. Dessine le graphe sur papier avec les flèches avant de coder.

---

## Défi

> Étant donné un graphe orienté représentant des cours et leurs prérequis, détermine s'il est possible de suivre tous les cours (pas de dépendance circulaire), et si oui, donne un ordre valide.

<details>
<summary>Réponse</summary>

```typescript
function courseSchedule(
  numCourses: number,
  prerequisites: [number, number][],
): number[] | null {
  const graph = createGraph<number>();

  for (let i = 0; i < numCourses; i++) addVertex(graph, i);
  for (const [course, prereq] of prerequisites) {
    addEdge(graph, prereq, course, true);
  }

  return kahnTopologicalSort(graph);
}

// 4 cours, prérequis : 1→0, 2→0, 3→1, 3→2
const order = courseSchedule(4, [[1, 0], [2, 0], [3, 1], [3, 2]]);
console.log(order); // [0, 1, 2, 3] ou [0, 2, 1, 3]

// Avec cycle : impossible
const impossible = courseSchedule(2, [[0, 1], [1, 0]]);
console.log(impossible); // null
```

</details>

---

::: tip Parcours recommandé
📖 Module terminé → Fais le **Lab 07** (graphe de dépendances) → puis le **Quiz 07**.
:::
