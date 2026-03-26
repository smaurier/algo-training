# Module 10 — Greedy, Union-Find et structures avancées

> **Objectif** : maîtriser les algorithmes gloutons, comprendre Union-Find (Disjoint Set), découvrir le Trie (arbre de préfixes) et appliquer ces structures à des problèmes concrets de développement.

> **Difficulté** : ⭐⭐⭐⭐

::: info Pas de panique !
Les algorithmes gloutons paraissent trop simples pour fonctionner — et parfois ils ne fonctionnent pas. L'enjeu est d'apprendre **quand** ils marchent et **comment le prouver**. Union-Find et Trie sont des structures que tu utiliseras rarement directement, mais qui apparaissent sous le capot de nombreux outils.
:::

---

## Prérequis

- Module 01 (complexité)
- Module 07 (graphes — pour Union-Find sur les composantes connexes)
- Module 09 (DP — pour comparer greedy vs DP)

---

## 1. Algorithmes Greedy (gloutons)

### 1.1 Principe

```
Un algorithme greedy fait le MEILLEUR CHOIX LOCAL à chaque étape,
en espérant que ça mènera à une solution GLOBALEMENT optimale.

Ça marche quand :
1. Propriété de choix glouton : un choix localement optimal fait partie
   d'une solution globalement optimale
2. Sous-structure optimale : la solution du sous-problème est aussi optimale

Ça ne marche PAS quand :
- Le meilleur choix immédiat peut mener à un mauvais résultat global
- Exemple : coin change avec pièces arbitraires (cf. module 09, DP nécessaire)
```

### 1.2 Greedy vs DP

```
┌────────────────────────┬─────────────────────┬─────────────────────┐
│                        │  Greedy             │  DP                 │
├────────────────────────┼─────────────────────┼─────────────────────┤
│  Approche              │  Choix local opt.   │  Toutes les options │
│  Regarde               │  Jamais en arrière  │  Sous-problèmes     │
│  Performance           │  Souvent O(n log n) │  Souvent O(n²)      │
│  Garantie optimale     │  Seulement si ok    │  Toujours optimale  │
│  Implémentation        │  Simple             │  Plus complexe      │
│  Quand l'utiliser      │  Si propriété prov. │  Quand greedy fail  │
└────────────────────────┴─────────────────────┴─────────────────────┘
```

---

## 2. Problèmes Greedy classiques

### 2.1 Activity Selection (intervalles sans chevauchement)

```typescript
// Maximiser le nombre d'activités non chevauchantes
// Stratégie : trier par fin, prendre la première qui ne chevauche pas

interface Activity {
  name: string;
  start: number;
  end: number;
}

function maxActivities(activities: Activity[]): Activity[] {
  // Trier par heure de fin
  const sorted = [...activities].sort((a, b) => a.end - b.end);
  const selected: Activity[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const last = selected[selected.length - 1];
    if (sorted[i].start >= last.end) {
      selected.push(sorted[i]);
    }
  }

  return selected;
}

const activities: Activity[] = [
  { name: 'Meeting A', start: 1, end: 3 },
  { name: 'Meeting B', start: 2, end: 5 },
  { name: 'Meeting C', start: 3, end: 6 },
  { name: 'Meeting D', start: 5, end: 7 },
  { name: 'Meeting E', start: 6, end: 8 },
  { name: 'Meeting F', start: 8, end: 9 },
];

console.log(maxActivities(activities).map(a => a.name));
// ['Meeting A', 'Meeting D', 'Meeting F'] → 3 activités
```

### 2.2 Nombre minimum de salles de réunion

```typescript
// Combien de salles faut-il pour accueillir toutes les réunions ?
// Stratégie : sweep line — trier les événements start/end

function minMeetingRooms(intervals: [number, number][]): number {
  const events: [number, number][] = []; // [time, +1 pour start ou -1 pour end]

  for (const [start, end] of intervals) {
    events.push([start, 1]);
    events.push([end, -1]);
  }

  events.sort((a, b) => a[0] - b[0] || a[1] - b[1]); // end avant start si même heure

  let rooms = 0;
  let maxRooms = 0;

  for (const [, delta] of events) {
    rooms += delta;
    maxRooms = Math.max(maxRooms, rooms);
  }

  return maxRooms;
}

console.log(minMeetingRooms([[0, 30], [5, 10], [15, 20]])); // 2
console.log(minMeetingRooms([[7, 10], [2, 4]]));              // 1
```

### 2.3 Fractional Knapsack (sac à dos fractionnel)

```typescript
// Contrairement au 0/1 knapsack (DP), on peut prendre des fractions d'objets
// Greedy : trier par valeur/poids décroissant

interface FracItem { name: string; weight: number; value: number }

function fractionalKnapsack(items: FracItem[], capacity: number): number {
  // Trier par ratio valeur/poids décroissant
  const sorted = [...items].sort((a, b) =>
    (b.value / b.weight) - (a.value / a.weight),
  );

  let totalValue = 0;
  let remaining = capacity;

  for (const item of sorted) {
    if (remaining <= 0) break;
    const take = Math.min(item.weight, remaining);
    totalValue += take * (item.value / item.weight);
    remaining -= take;
  }

  return totalValue;
}

console.log(fractionalKnapsack([
  { name: 'Gold', weight: 10, value: 600 },    // 60/kg
  { name: 'Silver', weight: 20, value: 500 },  // 25/kg
  { name: 'Bronze', weight: 30, value: 400 },  // 13.3/kg
], 50));
// 600 + 500 + 20*13.33 = 1366.67
```

### 2.4 Huffman Encoding (preview)

```typescript
// Compression : attribuer des codes binaires courts aux caractères fréquents
// C'est le greedy classique avec une priority queue

interface HuffNode { char: string | null; freq: number; left?: HuffNode; right?: HuffNode }

function huffmanCodes(text: string): Map<string, string> {
  // Compter les fréquences
  const freq = new Map<string, number>();
  for (const c of text) freq.set(c, (freq.get(c) ?? 0) + 1);

  // Construire les nœuds feuilles triés par fréquence
  const nodes: HuffNode[] = [...freq.entries()]
    .map(([char, f]) => ({ char, freq: f }))
    .sort((a, b) => a.freq - b.freq);

  // Construire l'arbre (version simplifiée sans MinHeap)
  while (nodes.length > 1) {
    const left = nodes.shift()!;
    const right = nodes.shift()!;
    const parent: HuffNode = {
      char: null,
      freq: left.freq + right.freq,
      left,
      right,
    };
    // Insérer au bon endroit (maintenir le tri)
    const idx = nodes.findIndex(n => n.freq > parent.freq);
    if (idx === -1) nodes.push(parent);
    else nodes.splice(idx, 0, parent);
  }

  // Extraire les codes
  const codes = new Map<string, string>();
  function traverse(node: HuffNode, code: string) {
    if (node.char) {
      codes.set(node.char, code || '0');
      return;
    }
    if (node.left) traverse(node.left, code + '0');
    if (node.right) traverse(node.right, code + '1');
  }

  if (nodes[0]) traverse(nodes[0], '');
  return codes;
}

const codes = huffmanCodes('AABBBCCCCDDDDDD');
console.log([...codes.entries()]);
// D (6) → code court, A (2) → code long
```

---

## 3. Union-Find (Disjoint Set Union)

### 3.1 Concept

```
Union-Find gère des ensembles disjoints avec deux opérations :
- find(x) : trouver le représentant du groupe de x
- union(x, y) : fusionner les groupes de x et y

Utilisation :
- Composantes connexes dynamiques
- Détection de cycles dans un graphe non orienté
- Kruskal's MST (arbre couvrant minimal)
- Groupement de données (clustering)
```

### 3.2 Implémentation optimisée

```typescript
class UnionFind {
  private parent: number[];
  private rank: number[];
  private _count: number;

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i); // Chacun est son propre parent
    this.rank = new Array(n).fill(0);
    this._count = n;
  }

  // Trouver le représentant avec path compression — O(α(n)) ≈ O(1)
  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // ← path compression
    }
    return this.parent[x];
  }

  // Fusionner deux groupes — O(α(n)) ≈ O(1)
  union(x: number, y: number): boolean {
    const rootX = this.find(x);
    const rootY = this.find(y);

    if (rootX === rootY) return false; // Déjà dans le même groupe

    // Union by rank
    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
    } else {
      this.parent[rootY] = rootX;
      this.rank[rootX]++;
    }

    this._count--;
    return true;
  }

  connected(x: number, y: number): boolean {
    return this.find(x) === this.find(y);
  }

  get count(): number {
    return this._count;
  }
}

const uf = new UnionFind(5);
console.log(uf.count); // 5 composantes
uf.union(0, 1);
uf.union(2, 3);
console.log(uf.count); // 3 composantes
console.log(uf.connected(0, 1)); // true
console.log(uf.connected(0, 2)); // false
uf.union(1, 3);
console.log(uf.count); // 2 composantes
console.log(uf.connected(0, 2)); // true (via 0-1-3-2)
```

### 3.3 Détection de cycle avec Union-Find

```typescript
function hasCycleUF(n: number, edges: [number, number][]): boolean {
  const uf = new UnionFind(n);

  for (const [u, v] of edges) {
    if (!uf.union(u, v)) return true; // Déjà connectés → cycle !
  }

  return false;
}

console.log(hasCycleUF(4, [[0, 1], [1, 2], [2, 3]]));           // false
console.log(hasCycleUF(4, [[0, 1], [1, 2], [2, 3], [3, 0]]));   // true
```

### 3.4 Nombre d'îles avec Union-Find

```typescript
function numIslandsUF(grid: string[][]): number {
  const rows = grid.length;
  const cols = grid[0].length;
  const uf = new UnionFind(rows * cols);
  let water = 0;

  const id = (r: number, c: number) => r * cols + c;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '0') {
        water++;
        continue;
      }
      // Unifier avec les voisins droite et bas
      if (r + 1 < rows && grid[r + 1][c] === '1') uf.union(id(r, c), id(r + 1, c));
      if (c + 1 < cols && grid[r][c + 1] === '1') uf.union(id(r, c), id(r, c + 1));
    }
  }

  return uf.count - water;
}
```

---

## 4. Trie (arbre de préfixes)

### 4.1 Concept

```
Un Trie stocke des chaînes caractère par caractère dans un arbre.
Chaque chemin de la racine à un nœud marqué "fin" représente un mot.

Exemple pour : ["cat", "car", "card", "care", "dog"]

         root
        /    \
       c      d
       |      |
       a      o
      / \     |
     t   r    g*
    *   / \
       d*  e*

Opérations :
- insert(word) : O(m) où m = longueur du mot
- search(word) : O(m)
- startsWith(prefix) : O(m)
- autocomplete(prefix) : O(m + k) où k = nombre de résultats
```

### 4.2 Implémentation

```typescript
class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEnd = false;
}

class Trie {
  private root = new TrieNode();

  insert(word: string): void {
    let node = this.root;
    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char)!;
    }
    node.isEnd = true;
  }

  search(word: string): boolean {
    const node = this.findNode(word);
    return node !== null && node.isEnd;
  }

  startsWith(prefix: string): boolean {
    return this.findNode(prefix) !== null;
  }

  // Autocomplétion : tous les mots qui commencent par prefix
  autocomplete(prefix: string, limit = 10): string[] {
    const node = this.findNode(prefix);
    if (!node) return [];

    const results: string[] = [];
    this.collect(node, prefix, results, limit);
    return results;
  }

  private findNode(word: string): TrieNode | null {
    let node = this.root;
    for (const char of word) {
      if (!node.children.has(char)) return null;
      node = node.children.get(char)!;
    }
    return node;
  }

  private collect(node: TrieNode, prefix: string, results: string[], limit: number): void {
    if (results.length >= limit) return;
    if (node.isEnd) results.push(prefix);

    for (const [char, child] of node.children) {
      this.collect(child, prefix + char, results, limit);
    }
  }
}

const trie = new Trie();
['cat', 'car', 'card', 'care', 'careful', 'dog', 'dodge', 'done'].forEach(
  w => trie.insert(w),
);

console.log(trie.search('car'));          // true
console.log(trie.search('ca'));           // false
console.log(trie.startsWith('ca'));       // true
console.log(trie.autocomplete('car'));    // ['car', 'card', 'care', 'careful']
console.log(trie.autocomplete('do'));     // ['dog', 'dodge', 'done']
```

---

## 5. Cas terrain

### 5.1 Barre de recherche avec autocomplétion

```typescript
// API endpoint pour la recherche avec Trie pré-chargé

class SearchIndex {
  private trie = new Trie();

  constructor(entries: string[]) {
    for (const entry of entries) {
      this.trie.insert(entry.toLowerCase());
    }
  }

  suggest(query: string, limit = 5): string[] {
    return this.trie.autocomplete(query.toLowerCase(), limit);
  }
}

const index = new SearchIndex([
  'JavaScript', 'Java', 'Python', 'TypeScript', 'PHP', 'Ruby',
  'Rust', 'Go', 'Kotlin', 'Swift',
]);

console.log(index.suggest('ja'));  // ['java', 'javascript']
console.log(index.suggest('r'));   // ['ruby', 'rust']
```

### 5.2 Planification greedy de tâches

```typescript
// Assigner des tâches à des workers en minimisant le temps total
// Stratégie greedy : assigner la plus lourde tâche au worker le plus libre

function scheduleJobs(tasks: number[], numWorkers: number): number {
  // Trier les tâches par durée décroissante
  const sorted = [...tasks].sort((a, b) => b - a);
  const workerLoads = new Array(numWorkers).fill(0);

  for (const task of sorted) {
    // Trouver le worker le moins chargé
    const minIdx = workerLoads.indexOf(Math.min(...workerLoads));
    workerLoads[minIdx] += task;
  }

  return Math.max(...workerLoads);
}

console.log(scheduleJobs([3, 5, 7, 2, 8, 1], 3));
// Worker 0: 8+1=9, Worker 1: 7+2=9, Worker 2: 5+3=8 → max = 9
```

---

## Points clés

1. **Greedy** = meilleur choix local → espérer une solution globale optimale.
2. Greedy marche quand on peut **prouver** la propriété de choix glouton.
3. **Activity Selection** = trier par fin, **Meeting Rooms** = sweep line.
4. **Union-Find** = gérer des ensembles disjoints en O(α(n)) ≈ O(1) amorti.
5. Path compression + union by rank = les deux optimisations essentielles.
6. **Trie** = arbre de préfixes, idéal pour autocomplétion et recherche par préfixe.
7. Trie insert/search = O(m) où m = longueur du mot.
8. En entretien : interval scheduling, merge intervals, Trie avec wildcards, Union-Find pour composantes.
9. En production : scheduling de tâches, autocomplétion, filtrage IP, détection de clusters.

---

## Pour aller plus loin

- [Wikipedia — Greedy algorithms](https://en.wikipedia.org/wiki/Greedy_algorithm)
- [VisuAlgo — Union-Find](https://visualgo.net/en/ufds)
- [VisuAlgo — Suffixarray](https://visualgo.net/en/suffixarray) — variante avancée du Trie
- [CP Algorithms — DSU](https://cp-algorithms.com/data_structures/disjoint_set_union.html) — Union-Find détaillé

---

## Si tu es perdu

1. Greedy = prendre le meilleur choix maintenant, ne jamais revenir en arrière.
2. Si greedy ne marche pas → essayer DP.
3. Union-Find = « est-ce que A et B sont dans le même groupe ? »
4. Trie = arbre où chaque lettre est un nœud.
5. Dessine la structure de données sur papier pour comprendre.

---

## Défi

> Implémente l'algorithme de Kruskal pour trouver l'arbre couvrant minimal (MST) d'un graphe pondéré non orienté. Utilise Union-Find pour vérifier que l'ajout d'une arête ne crée pas de cycle.

<details>
<summary>Réponse</summary>

```typescript
interface Edge { from: number; to: number; weight: number }

function kruskal(n: number, edges: Edge[]): { mst: Edge[]; totalWeight: number } {
  // Trier les arêtes par poids croissant (greedy)
  const sorted = [...edges].sort((a, b) => a.weight - b.weight);
  const uf = new UnionFind(n);
  const mst: Edge[] = [];
  let totalWeight = 0;

  for (const edge of sorted) {
    if (uf.union(edge.from, edge.to)) {
      mst.push(edge);
      totalWeight += edge.weight;
      if (mst.length === n - 1) break; // MST a n-1 arêtes
    }
  }

  return { mst, totalWeight };
}

const edges: Edge[] = [
  { from: 0, to: 1, weight: 4 },
  { from: 0, to: 2, weight: 8 },
  { from: 1, to: 2, weight: 2 },
  { from: 1, to: 3, weight: 5 },
  { from: 2, to: 3, weight: 5 },
  { from: 2, to: 4, weight: 9 },
  { from: 3, to: 4, weight: 4 },
];

const { mst, totalWeight } = kruskal(5, edges);
console.log(totalWeight); // 15 (arêtes: 1-2(2), 0-1(4), 3-4(4), 1-3(5))
console.log(mst);
```

</details>

---

::: tip Parcours recommandé
📖 Module terminé → Fais le **Lab 10** (Union-Find et Trie) → puis le **Quiz 10**.
:::
