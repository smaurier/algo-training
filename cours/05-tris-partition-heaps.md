# Module 05 — Tris, partition, heaps

> **Objectif** : comprendre quand trier, quand partitionner, et quand un heap remplace avantageusement un tri complet. Implémenter un heap en TypeScript et maîtriser les patterns top-K.

> **Difficulté** : ⭐⭐⭐

::: info Pas de panique !
Tu n'as pas besoin de coder merge sort ou quick sort de mémoire (JavaScript a Array.sort). L'important est de comprendre **quand** trier, **comment** ça marche sous le capot, et surtout **quand un heap fait mieux**.
:::

---

## Prérequis

- Module 04 terminé (récursion, divide & conquer)
- Comprendre O(n log n), O(n), O(log n)

---

## 1. Pourquoi trier

Trier coûte $O(n \log n)$, mais le gain peut être **énorme** ensuite :

```
Problème sans tri                    Problème APRÈS tri
──────────────────                   ──────────────────
Doublons → O(n²) double boucle      Doublons → O(n) comparaison voisins
Médiane → O(n) selection algo        Médiane → O(1) accès direct
Top K → O(n×k) ou tri partiel        Top K → O(1) slice
Fusion de listes → O(n×m)           Fusion → O(n+m) deux pointeurs
Intervalles → O(n²) tous les couples Intervalles → O(n) scan trié
Recherche → O(n) scan                Recherche → O(log n) binary search
```

> 💡 Règle : si tu dois faire **plusieurs opérations** sur les mêmes données, un tri préalable est souvent rentable.

---

## 2. Array.sort() en JavaScript — ce qu'il faut savoir

### 2.1 TimSort sous le capot

```typescript
// Array.sort() utilise TimSort dans V8 (Chrome / Node.js)
// C'est un hybride merge sort + insertion sort

// ⚠️ LE PIÈGE CLASSIQUE : sort sans comparator
const nums = [10, 9, 2, 100, 3];
console.log(nums.sort());
// [10, 100, 2, 3, 9] ← TRI LEXICOGRAPHIQUE ! Pas numérique !

// ✅ Toujours fournir une fonction de comparaison
console.log(nums.sort((a, b) => a - b));
// [2, 3, 9, 10, 100]

// Propriétés de TimSort :
// - O(n log n) dans le pire cas
// - O(n) quand le tableau est déjà presque trié
// - Stable (les éléments égaux gardent leur ordre relatif)
// - In-place (modifie le tableau original)
```

### 2.2 Tri custom sur des objets

```typescript
interface Task {
  name: string;
  priority: number;
  dueDate: string; // ISO date
}

const tasks: Task[] = [
  { name: 'Deploy', priority: 1, dueDate: '2024-03-01' },
  { name: 'Tests', priority: 2, dueDate: '2024-02-28' },
  { name: 'Fix bug', priority: 1, dueDate: '2024-02-27' },
  { name: 'Review', priority: 3, dueDate: '2024-03-01' },
];

// Tri multi-critères : priorité asc, puis date asc
tasks.sort((a, b) => {
  if (a.priority !== b.priority) return a.priority - b.priority;
  return a.dueDate.localeCompare(b.dueDate);
});

console.log(tasks.map(t => `${t.name}(P${t.priority})`));
// ['Fix bug(P1)', 'Deploy(P1)', 'Tests(P2)', 'Review(P3)']
```

---

## 3. Partition — le cœur de Quick sort

### 3.1 Le principe

La partition sépare un tableau en deux groupes autour d'un pivot :

```
Avant : [3, 6, 2, 8, 1, 7, 4]   pivot = 4
         ↓
Après : [3, 2, 1, (4), 6, 8, 7]
         ≤ pivot    pivot  > pivot
```

### 3.2 Partition de Lomuto

```typescript
function partition(arr: number[], lo: number, hi: number): number {
  const pivot = arr[hi]; // dernier élément comme pivot
  let i = lo; // frontière entre "≤ pivot" et "> pivot"

  for (let j = lo; j < hi; j++) {
    if (arr[j] <= pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]]; // swap
      i++;
    }
  }

  [arr[i], arr[hi]] = [arr[hi], arr[i]]; // mettre le pivot à sa place
  return i; // index final du pivot
}

const arr = [3, 6, 2, 8, 1, 7, 4];
const pivotIdx = partition(arr, 0, arr.length - 1);
console.log(arr);        // [3, 2, 1, 4, 6, 7, 8] (ou variant)
console.log(pivotIdx);   // 3 — le pivot 4 est à sa position finale
```

### 3.3 Quick select — trouver le k-ième élément en O(n) moyen

```typescript
// Le même principe que quick sort, mais on ne trie qu'un côté

function quickSelect(arr: number[], k: number): number {
  // k est 0-indexed
  const a = [...arr]; // ne pas modifier l'original
  return select(a, 0, a.length - 1, k);
}

function select(arr: number[], lo: number, hi: number, k: number): number {
  if (lo === hi) return arr[lo];

  const pivotIdx = partition(arr, lo, hi);

  if (k === pivotIdx) return arr[k];
  if (k < pivotIdx) return select(arr, lo, pivotIdx - 1, k);
  return select(arr, pivotIdx + 1, hi, k);
}

// Trouver la médiane
const data = [7, 10, 4, 3, 20, 15];
const median = quickSelect(data, Math.floor(data.length / 2));
console.log(median); // 10

// Complexité : O(n) en moyenne, O(n²) pire cas
// Bien meilleur que de trier pour juste trouver un élément
```

---

## 4. Heap (tas) — la star du module

### 4.1 Pourquoi un heap ?

```
Scénario : 1 million de transactions, tu veux les 10 plus chères.

Option 1 : trier tout → O(n log n) = ~20M opérations
Option 2 : heap de taille 10 → O(n log k) = ~33 opérations par élément
            → ~3.3M opérations pour k=10

Quand k << n, le heap est massif gagnant.
```

### 4.2 Le concept

```
Un heap est un arbre binaire COMPLET avec une propriété d'ordre :
- Min-heap : chaque parent ≤ ses enfants → la racine est le minimum
- Max-heap : chaque parent ≥ ses enfants → la racine est le maximum

Exemple de min-heap :
           1
         /   \
        3     2
       / \   /
      7   4  5

Propriété : arr[parent] ≤ arr[enfant]
Stocké en tableau : [1, 3, 2, 7, 4, 5]

Relations d'index (0-based) :
- Parent de i     : Math.floor((i - 1) / 2)
- Enfant gauche   : 2i + 1
- Enfant droit    : 2i + 2
```

### 4.3 Implémentation complète — MinHeap

```typescript
class MinHeap<T> {
  private items: T[] = [];

  constructor(private compareFn: (a: T, b: T) => number = (a: any, b: any) => a - b) {}

  get size(): number { return this.items.length; }
  isEmpty(): boolean { return this.items.length === 0; }

  peek(): T | undefined {
    return this.items[0];
  }

  push(item: T): void {
    this.items.push(item);
    this.bubbleUp(this.items.length - 1);
  }

  pop(): T | undefined {
    if (this.isEmpty()) return undefined;

    const min = this.items[0];
    const last = this.items.pop()!;

    if (this.items.length > 0) {
      this.items[0] = last;
      this.bubbleDown(0);
    }

    return min;
  }

  private bubbleUp(i: number): void {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.compareFn(this.items[i], this.items[parent]) >= 0) break;
      [this.items[i], this.items[parent]] = [this.items[parent], this.items[i]];
      i = parent;
    }
  }

  private bubbleDown(i: number): void {
    const n = this.items.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;

      if (left < n && this.compareFn(this.items[left], this.items[smallest]) < 0) {
        smallest = left;
      }
      if (right < n && this.compareFn(this.items[right], this.items[smallest]) < 0) {
        smallest = right;
      }

      if (smallest === i) break;
      [this.items[i], this.items[smallest]] = [this.items[smallest], this.items[i]];
      i = smallest;
    }
  }
}

// Utilisation
const heap = new MinHeap<number>();
heap.push(5);
heap.push(3);
heap.push(7);
heap.push(1);

console.log(heap.pop()); // 1
console.log(heap.pop()); // 3
console.log(heap.pop()); // 5
console.log(heap.pop()); // 7
// Éléments sortent dans l'ordre croissant !
```

### 4.4 Coûts des opérations

| Opération | Complexité | Explication |
|-----------|-----------|-------------|
| `push` | $O(\log n)$ | Remonte au maximum la hauteur de l'arbre |
| `pop` | $O(\log n)$ | Descend au maximum la hauteur de l'arbre |
| `peek` | $O(1)$ | La racine est toujours le min/max |
| Construction depuis tableau | $O(n)$ | Heapify bottom-up (pas n × push) |

### 4.5 Le pattern Top-K

```typescript
// Trouver les K plus grands éléments → utiliser un MIN-heap de taille K
// (contre-intuitif ! On garde un min-heap pour éjecter les petits)

function topK(items: number[], k: number): number[] {
  const heap = new MinHeap<number>();

  for (const item of items) {
    heap.push(item);
    if (heap.size > k) {
      heap.pop(); // éjecte le plus petit du heap
    }
  }

  // Le heap contient les k plus grands
  const result: number[] = [];
  while (!heap.isEmpty()) {
    result.push(heap.pop()!);
  }
  return result.reverse(); // du plus grand au plus petit
}

console.log(topK([3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5], 3));
// [9, 6, 5]

// Complexité : O(n log k)
// Pour n = 1M et k = 10 : ~3.3M opérations au lieu de ~20M (tri complet)
```

### 4.6 Top-K sur des objets

```typescript
// Scénario : trouver les 5 articles les plus chers dans un catalogue de 100k articles

interface Article {
  id: string;
  name: string;
  price: number;
}

function topArticlesByPrice(articles: Article[], k: number): Article[] {
  const heap = new MinHeap<Article>((a, b) => a.price - b.price);

  for (const article of articles) {
    heap.push(article);
    if (heap.size > k) {
      heap.pop(); // éjecte l'article le moins cher du heap
    }
  }

  const result: Article[] = [];
  while (!heap.isEmpty()) result.push(heap.pop()!);
  return result.reverse();
}

// Utilisation
const catalog: Article[] = [
  { id: 'a1', name: 'Écran 4K', price: 599 },
  { id: 'a2', name: 'Souris', price: 29 },
  { id: 'a3', name: 'Clavier mécanique', price: 149 },
  { id: 'a4', name: 'MacBook Pro', price: 2499 },
  { id: 'a5', name: 'Hub USB', price: 39 },
  { id: 'a6', name: 'Webcam', price: 89 },
];

console.log(topArticlesByPrice(catalog, 3).map(a => a.name));
// ['MacBook Pro', 'Écran 4K', 'Clavier mécanique']
```

---

## 5. Heap sort

```typescript
// Trier un tableau en utilisant un heap → O(n log n) garanti

function heapSort(arr: number[]): number[] {
  const heap = new MinHeap<number>();
  for (const item of arr) heap.push(item); // O(n log n)

  const result: number[] = [];
  while (!heap.isEmpty()) result.push(heap.pop()!); // O(n log n)

  return result;
}

console.log(heapSort([4, 10, 3, 5, 1])); // [1, 3, 4, 5, 10]

// Comparaison des tris :
// ┌─────────────┬───────────────┬──────────┬─────────┐
// │ Algorithme  │ Complexité    │ Stable ? │ In-place│
// ├─────────────┼───────────────┼──────────┼─────────┤
// │ TimSort     │ O(n log n)    │ Oui ✅   │ Oui     │
// │ Merge sort  │ O(n log n)    │ Oui ✅   │ Non     │
// │ Quick sort  │ O(n log n)*   │ Non ❌   │ Oui     │
// │ Heap sort   │ O(n log n)    │ Non ❌   │ Oui**   │
// │ Counting    │ O(n + k)      │ Oui ✅   │ Non     │
// └─────────────┴───────────────┴──────────┴─────────┘
// * O(n²) pire cas
// ** version in-place possible
```

---

## 6. Counting sort — tri non-comparatif

```typescript
// Quand les valeurs sont des entiers dans une plage connue,
// on peut trier en O(n + k) au lieu de O(n log n)

function countingSort(arr: number[]): number[] {
  if (arr.length === 0) return [];

  const max = Math.max(...arr);
  const min = Math.min(...arr);
  const range = max - min + 1;
  const counts = new Array(range).fill(0);

  // Compter les occurrences
  for (const val of arr) {
    counts[val - min]++;
  }

  // Reconstruire le tableau trié
  const result: number[] = [];
  for (let i = 0; i < range; i++) {
    for (let j = 0; j < counts[i]; j++) {
      result.push(i + min);
    }
  }

  return result;
}

// Utile quand : notes (0-20), âges (0-120), codes HTTP (100-599)
console.log(countingSort([4, 2, 2, 8, 3, 3, 1])); // [1, 2, 2, 3, 3, 4, 8]
```

---

## 7. Cas terrain

### 7.1 Système de notifications avec priorité

```typescript
interface Notification {
  id: string;
  message: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  timestamp: number;
}

const priorityMap = { critical: 0, high: 1, medium: 2, low: 3 };

class NotificationCenter {
  private heap = new MinHeap<Notification>((a, b) => {
    const pDiff = priorityMap[a.priority] - priorityMap[b.priority];
    if (pDiff !== 0) return pDiff;
    return a.timestamp - b.timestamp; // FIFO pour même priorité
  });

  push(notif: Notification): void {
    this.heap.push(notif);
  }

  getNext(): Notification | undefined {
    return this.heap.pop();
  }

  get pending(): number { return this.heap.size; }
}
```

### 7.2 Merge de K listes triées

```typescript
// Scénario : tu as K sources de données triées (ex: K partitions de BDD)
// et tu veux fusionner en une seule liste triée

function mergeKSorted(lists: number[][]): number[] {
  // Heap de { value, listIndex, elementIndex }
  const heap = new MinHeap<{ val: number; li: number; ei: number }>(
    (a, b) => a.val - b.val,
  );

  // Initialiser avec le premier élément de chaque liste
  for (let i = 0; i < lists.length; i++) {
    if (lists[i].length > 0) {
      heap.push({ val: lists[i][0], li: i, ei: 0 });
    }
  }

  const result: number[] = [];
  while (!heap.isEmpty()) {
    const { val, li, ei } = heap.pop()!;
    result.push(val);

    // Ajouter l'élément suivant de la même liste
    if (ei + 1 < lists[li].length) {
      heap.push({ val: lists[li][ei + 1], li, ei: ei + 1 });
    }
  }

  return result;
}

console.log(mergeKSorted([
  [1, 4, 7],
  [2, 5, 8],
  [3, 6, 9],
])); // [1, 2, 3, 4, 5, 6, 7, 8, 9]

// Complexité : O(N log K) — N total d'éléments, K nombre de listes
// Le heap ne contient jamais plus de K éléments
```

---

## Démonstrations

### Demo 1 — Comparaison : tri complet vs heap pour Top-K

```typescript
const N = 1_000_000;
const K = 10;
const data = Array.from({ length: N }, () => Math.random() * 1_000_000);

// Approche 1 : tri complet
console.time('sort + slice');
const sorted = [...data].sort((a, b) => b - a);
const top1 = sorted.slice(0, K);
console.timeEnd('sort + slice');

// Approche 2 : heap
console.time('heap top-K');
const top2 = topK(data, K);
console.timeEnd('heap top-K');

// Le heap est ~3-5× plus rapide pour K << N
```

### Demo 2 — Médiane glissante (running median)

```typescript
// Problème : maintenir la médiane d'un flux de données
// Solution : deux heaps — un max-heap pour la moitié basse, un min-heap pour la moitié haute

class MedianTracker {
  private lo = new MinHeap<number>((a, b) => b - a); // max-heap (inversé)
  private hi = new MinHeap<number>();                  // min-heap

  add(num: number): void {
    this.lo.push(num);

    // Assurer que tous les éléments de lo ≤ tous les éléments de hi
    this.hi.push(this.lo.pop()!);

    // Équilibrer les tailles (lo peut avoir au plus 1 de plus que hi)
    if (this.hi.size > this.lo.size) {
      this.lo.push(this.hi.pop()!);
    }
  }

  getMedian(): number {
    if (this.lo.size > this.hi.size) {
      return this.lo.peek()!;
    }
    return (this.lo.peek()! + this.hi.peek()!) / 2;
  }
}

const tracker = new MedianTracker();
tracker.add(1); console.log(tracker.getMedian()); // 1
tracker.add(2); console.log(tracker.getMedian()); // 1.5
tracker.add(3); console.log(tracker.getMedian()); // 2
tracker.add(10); console.log(tracker.getMedian()); // 2.5

// Chaque ajout : O(log n), lecture de la médiane : O(1)
```

---

## Points clés

1. `Array.sort()` est $O(n \log n)$ — toujours fournir un comparateur pour les nombres.
2. Le tri est un **investissement** : il coûte $O(n \log n)$ mais peut rendre les opérations suivantes bien plus rapides.
3. La **partition** (Lomuto/Hoare) est la brique de base du quick sort et du quick select.
4. **Quick select** trouve le k-ième élément en $O(n)$ moyen — pas besoin de trier tout.
5. Le **heap** est un arbre binaire complet maintenant min (ou max) en racine.
6. Push/pop en $O(\log n)$, peek en $O(1)$.
7. Pour **top-K** : utiliser un min-heap de taille K. Complexité $O(n \log k)$.
8. Pour la **médiane en flux** : deux heaps (max-heap + min-heap).
9. **Counting sort** en $O(n + k)$ quand les valeurs sont des entiers dans une plage connue.
10. Le heap remplace avantageusement un tri complet quand on ne veut qu'une partie du résultat.

---

## Pour aller plus loin

- [VisuAlgo — Heap](https://visualgo.net/en/heap) — visualisation interactive
- [VisuAlgo — Sorting](https://visualgo.net/en/sorting) — comparaison de tous les tris
- [V8 Blog — Array.sort stability](https://v8.dev/blog/array-sort) — pourquoi TimSort
- [Wikipedia — Heapsort](https://en.wikipedia.org/wiki/Heapsort) — détails algorithmiques
- [Brilliant — Heap](https://brilliant.org/wiki/heaps/) — tutoriel progressif

---

## Si tu es perdu

1. Trier c'est $O(n \log n)$ — ça vaut le coup si tu fais plusieurs opérations ensuite.
2. Heap = arbre binaire complet, le min/max est toujours en racine.
3. Pour les K meilleurs : min-heap de taille K, éjecte les petits.
4. `Array.sort((a, b) => a - b)` — ne jamais oublier le comparateur.
5. Quick select = trouver le k-ième sans tout trier.

---

## Défi

> Tu reçois un flux de 1 million de scores de joueurs. Tu dois maintenir en temps réel le top 100 des meilleurs scores, et pouvoir à tout moment retourner le 100e meilleur score (le "seuil d'entrée" dans le classement). Quelle structure utilises-tu et avec quel coût par opération ?

<details>
<summary>Réponse</summary>

Utilise un **min-heap de taille 100** :

```typescript
const leaderboard = new MinHeap<number>();

function addScore(score: number): void {
  if (leaderboard.size < 100) {
    leaderboard.push(score);
  } else if (score > leaderboard.peek()!) {
    leaderboard.pop();
    leaderboard.push(score);
  }
}

function getThreshold(): number | undefined {
  return leaderboard.peek(); // le 100e meilleur = le min du heap
}

// Coût par addScore : O(log 100) = O(1) pratiquement
// Coût de getThreshold : O(1)
// Espace : O(100) = O(1)
// Total sur 1M scores : O(n × log k) ≈ O(n)
```

Le min-heap de taille K garantit que le plus petit élément (= le seuil) est toujours en racine, accessible en O(1).

</details>

---

::: tip Parcours recommandé
📖 Module terminé → Fais la **visualisation Heap Operations** → puis le **Lab 05** → puis le **Quiz 05**.
:::
