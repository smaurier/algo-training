# Module 03 — Stacks, queues, listes chaînées

> **Objectif** : reconnaître les problèmes où l'ordre d'arrivée, de sortie ou de retour importe plus que la simple recherche, et implémenter ces structures en TypeScript.

> **Difficulté** : ⭐⭐

::: info Pas de panique !
Tu utilises déjà des stacks et des queues sans le savoir : le bouton "retour" de ton navigateur est une stack, et les `setTimeout` sont une queue. Ce module rend ces intuitions explicites et opérationnelles.
:::

---

## Prérequis

- Module 02 terminé (tableaux et Map/Set)
- Notion de complexité O(1), O(n)

---

## 1. Stack (pile) — LIFO

### 1.1 Le principe

```
LIFO = Last In, First Out
Le dernier élément empilé est le premier dépilé.

┌─────────┐
│  top    │ ← push ici, pop ici
├─────────┤
│  ...    │
├─────────┤
│  bottom │
└─────────┘
```

### 1.2 Analogie : pile d'assiettes

Quand tu empiles des assiettes, tu prends toujours celle du dessus. Pour atteindre celle du fond, tu dois d'abord retirer toutes celles au-dessus.

### 1.3 Opérations et coûts

| Opération | Description | Complexité |
|-----------|-------------|-----------|
| `push(x)` | Empiler un élément | $O(1)$ |
| `pop()` | Dépiler le sommet | $O(1)$ |
| `peek()` / `top()` | Voir le sommet sans dépiler | $O(1)$ |
| `isEmpty()` | Vérifier si la pile est vide | $O(1)$ |
| `size()` | Nombre d'éléments | $O(1)$ |

### 1.4 Implémentation en TypeScript

```typescript
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  get size(): number {
    return this.items.length;
  }
}

// Utilisation
const stack = new Stack<number>();
stack.push(10);
stack.push(20);
stack.push(30);
console.log(stack.peek()); // 30
console.log(stack.pop());  // 30
console.log(stack.pop());  // 20
console.log(stack.size);   // 1
```

> 💡 En JavaScript, un simple `Array` avec `push` / `pop` suffit comme stack. La classe est utile pour la clarté d'intention.

### 1.5 Le pattern classique — Validation de parenthèses

```typescript
// Problème : vérifier que les parenthèses/accolades/crochets sont bien fermés

function isBalanced(input: string): boolean {
  const stack: string[] = [];
  const pairs: Record<string, string> = {
    ')': '(',
    ']': '[',
    '}': '{',
  };
  const openers = new Set(['(', '[', '{']);

  for (const char of input) {
    if (openers.has(char)) {
      stack.push(char);
    } else if (char in pairs) {
      if (stack.pop() !== pairs[char]) {
        return false;
      }
    }
  }

  return stack.length === 0;
}

console.log(isBalanced('(())[{}]'));   // true
console.log(isBalanced('([)]'));       // false
console.log(isBalanced('{'));          // false
console.log(isBalanced(''));           // true

// Complexité : O(n) temps, O(n) espace dans le pire cas
```

### 1.6 Autres cas d'usage de la stack

```typescript
// Cas 1 — Évaluation d'expressions postfixées (notation polonaise inverse)
function evalRPN(tokens: string[]): number {
  const stack: number[] = [];
  const ops: Record<string, (a: number, b: number) => number> = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '*': (a, b) => a * b,
    '/': (a, b) => Math.trunc(a / b),
  };

  for (const token of tokens) {
    if (token in ops) {
      const b = stack.pop()!; // opérande droite d'abord (LIFO)
      const a = stack.pop()!;
      stack.push(ops[token](a, b));
    } else {
      stack.push(Number(token));
    }
  }

  return stack.pop()!;
}

// "3 4 + 2 *" = (3 + 4) * 2 = 14
console.log(evalRPN(['3', '4', '+', '2', '*'])); // 14

// Cas 2 — Undo/Redo
class UndoRedoManager<T> {
  private undoStack: T[] = [];
  private redoStack: T[] = [];

  execute(state: T): void {
    this.undoStack.push(state);
    this.redoStack = []; // redo est invalidé après une nouvelle action
  }

  undo(): T | undefined {
    const state = this.undoStack.pop();
    if (state !== undefined) {
      this.redoStack.push(state);
    }
    return state;
  }

  redo(): T | undefined {
    const state = this.redoStack.pop();
    if (state !== undefined) {
      this.undoStack.push(state);
    }
    return state;
  }
}

// Cas 3 — Navigation de chemins (path simplification)
function simplifyPath(path: string): string {
  const parts = path.split('/').filter(p => p && p !== '.');
  const stack: string[] = [];

  for (const part of parts) {
    if (part === '..') {
      stack.pop(); // remonter d'un niveau
    } else {
      stack.push(part);
    }
  }

  return '/' + stack.join('/');
}

console.log(simplifyPath('/home/user/../documents/./photos'));
// → '/home/documents/photos'
```

---

## 2. Queue (file) — FIFO

### 2.1 Le principe

```
FIFO = First In, First Out
Le premier élément enfilé est le premier défilé.

  enqueue →  ┌───┬───┬───┬───┬───┐  → dequeue
             │ E │ D │ C │ B │ A │
             └───┴───┴───┴───┴───┘
           back                  front
```

### 2.2 Analogie : file d'attente au supermarché

Le premier arrivé est le premier servi. Nouveaux clients en bout de file, service en tête de file.

### 2.3 Opérations et coûts

| Opération | Description | Complexité |
|-----------|-------------|-----------|
| `enqueue(x)` | Ajouter en fin | $O(1)$ |
| `dequeue()` | Retirer du début | $O(1)$* |
| `front()` / `peek()` | Voir le premier | $O(1)$ |
| `isEmpty()` | File vide ? | $O(1)$ |
| `size()` | Nombre d'éléments | $O(1)$ |

> ⚠️ \*Avec `Array.shift()`, c'est O(n) ! Il faut une implémentation correcte pour du O(1) réel.

### 2.4 Implémentation naïve vs correcte

```typescript
// ❌ Implémentation naïve — dequeue en O(n)
class NaiveQueue<T> {
  private items: T[] = [];

  enqueue(item: T): void {
    this.items.push(item); // O(1)
  }

  dequeue(): T | undefined {
    return this.items.shift(); // ⚠️ O(n) — décale tous les éléments !
  }
}

// ✅ Implémentation correcte — dequeue en O(1) amorti
class Queue<T> {
  private items: Record<number, T> = {};
  private head = 0;
  private tail = 0;

  enqueue(item: T): void {
    this.items[this.tail] = item;
    this.tail++;
  }

  dequeue(): T | undefined {
    if (this.isEmpty()) return undefined;
    const item = this.items[this.head];
    delete this.items[this.head];
    this.head++;
    return item;
  }

  peek(): T | undefined {
    return this.items[this.head];
  }

  isEmpty(): boolean {
    return this.tail === this.head;
  }

  get size(): number {
    return this.tail - this.head;
  }
}

// Utilisation
const queue = new Queue<string>();
queue.enqueue('Alice');
queue.enqueue('Bob');
queue.enqueue('Charlie');
console.log(queue.dequeue()); // 'Alice'
console.log(queue.dequeue()); // 'Bob'
console.log(queue.peek());    // 'Charlie'
console.log(queue.size);      // 1
```

### 2.5 Benchmark : shift() vs Queue correcte

```typescript
const N = 100_000;

// Array.shift() — O(n) par dequeue → O(n²) total
console.time('Array.shift');
const arr: number[] = [];
for (let i = 0; i < N; i++) arr.push(i);
for (let i = 0; i < N; i++) arr.shift();
console.timeEnd('Array.shift');

// Queue correcte — O(1) par dequeue → O(n) total
console.time('Queue O(1)');
const q = new Queue<number>();
for (let i = 0; i < N; i++) q.enqueue(i);
for (let i = 0; i < N; i++) q.dequeue();
console.timeEnd('Queue O(1)');

// Sur 100k éléments :
// Array.shift → ~500ms
// Queue O(1)  → ~5ms
```

### 2.6 Cas d'usage de la queue

```typescript
// Cas 1 — File de traitement de tâches (job queue)
interface Job {
  id: string;
  payload: unknown;
  createdAt: number;
}

class JobQueue {
  private queue = new Queue<Job>();
  private processing = false;

  addJob(payload: unknown): string {
    const id = `job_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    this.queue.enqueue({ id, payload, createdAt: Date.now() });
    console.log(`📥 Job ${id} ajouté (${this.queue.size} en attente)`);
    return id;
  }

  async processAll(handler: (job: Job) => Promise<void>): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (!this.queue.isEmpty()) {
      const job = this.queue.dequeue()!;
      console.log(`⚙️ Traitement de ${job.id}...`);
      await handler(job);
      console.log(`✅ ${job.id} terminé`);
    }

    this.processing = false;
  }
}

// Cas 2 — Buffer circulaire (derniers N événements)
class CircularBuffer<T> {
  private items: (T | undefined)[];
  private head = 0;
  private count = 0;

  constructor(private capacity: number) {
    this.items = new Array(capacity);
  }

  push(item: T): void {
    const index = (this.head + this.count) % this.capacity;
    if (this.count === this.capacity) {
      // Le buffer est plein, on écrase le plus vieux
      this.head = (this.head + 1) % this.capacity;
    } else {
      this.count++;
    }
    this.items[index] = item;
  }

  getAll(): T[] {
    const result: T[] = [];
    for (let i = 0; i < this.count; i++) {
      result.push(this.items[(this.head + i) % this.capacity] as T);
    }
    return result;
  }
}

// Garder les 5 dernières notifications
const buffer = new CircularBuffer<string>(5);
for (let i = 1; i <= 8; i++) buffer.push(`notif_${i}`);
console.log(buffer.getAll());
// ['notif_4', 'notif_5', 'notif_6', 'notif_7', 'notif_8']
```

---

## 3. Deque (double-ended queue)

```typescript
// Un deque permet l'ajout et le retrait aux DEUX extrémités en O(1)
// Utile pour le pattern "sliding window maximum" (module 11)

class Deque<T> {
  private items: Record<number, T> = {};
  private head = 0;
  private tail = 0;

  pushBack(item: T): void {
    this.items[this.tail++] = item;
  }

  pushFront(item: T): void {
    this.items[--this.head] = item;
  }

  popBack(): T | undefined {
    if (this.isEmpty()) return undefined;
    const item = this.items[--this.tail];
    delete this.items[this.tail];
    return item;
  }

  popFront(): T | undefined {
    if (this.isEmpty()) return undefined;
    const item = this.items[this.head];
    delete this.items[this.head++];
    return item;
  }

  peekFront(): T | undefined { return this.items[this.head]; }
  peekBack(): T | undefined { return this.items[this.tail - 1]; }
  isEmpty(): boolean { return this.tail === this.head; }
  get size(): number { return this.tail - this.head; }
}
```

---

## 4. Linked list — culture utile, usage rare en JS

### 4.1 Pourquoi en parler ?

En JavaScript, on implémente **rarement** de vraies listes chaînées en production. Les tableaux et `Map` couvrent 99% des besoins. Néanmoins, les comprendre est essentiel pour :

- raisonner sur les **pointeurs** et les références ;
- comprendre le fonctionnement interne de structures comme les **LRU caches** ;
- réussir les entretiens techniques (c'est un classique) ;
- lire du code dans d'autres langages (C, Rust, Go).

### 4.2 Singly Linked List

```typescript
class ListNode<T> {
  value: T;
  next: ListNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

class SinglyLinkedList<T> {
  head: ListNode<T> | null = null;
  private _size = 0;

  // Ajout en tête — O(1)
  prepend(value: T): void {
    const node = new ListNode(value);
    node.next = this.head;
    this.head = node;
    this._size++;
  }

  // Ajout en fin — O(n) car on doit traverser
  append(value: T): void {
    const node = new ListNode(value);
    if (!this.head) {
      this.head = node;
    } else {
      let current = this.head;
      while (current.next) current = current.next;
      current.next = node;
    }
    this._size++;
  }

  // Suppression par valeur — O(n)
  remove(value: T): boolean {
    if (!this.head) return false;

    if (this.head.value === value) {
      this.head = this.head.next;
      this._size--;
      return true;
    }

    let current = this.head;
    while (current.next) {
      if (current.next.value === value) {
        current.next = current.next.next;
        this._size--;
        return true;
      }
      current = current.next;
    }
    return false;
  }

  // Conversion en tableau pour affichage
  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  get size(): number { return this._size; }
}

const list = new SinglyLinkedList<number>();
list.prepend(3);
list.prepend(2);
list.prepend(1);
list.append(4);
console.log(list.toArray()); // [1, 2, 3, 4]
list.remove(3);
console.log(list.toArray()); // [1, 2, 4]
```

### 4.3 Comparaison Array vs Linked List

```
┌────────────────┬────────────────┬────────────────┐
│  Opération     │  Array         │  Linked List   │
├────────────────┼────────────────┼────────────────┤
│  Accès [i]     │  O(1) ✅       │  O(n) ❌       │
│  Push (fin)    │  O(1) amorti   │  O(n)*         │
│  Unshift (tête)│  O(n) ❌       │  O(1) ✅       │
│  Insert milieu │  O(n)          │  O(1)**        │
│  Suppression   │  O(n)          │  O(1)**        │
│  Recherche     │  O(n)          │  O(n)          │
│  Mémoire       │  Contiguë      │  Fragmentée    │
│  Cache CPU     │  Excellent     │  Mauvais       │
└────────────────┴────────────────┴────────────────┘
* O(1) avec un tail pointer
** O(1) si on a déjà le nœud précédent
```

### 4.4 LRU Cache — la killer app de la linked list

```typescript
// LRU = Least Recently Used
// On combine une Map (lookup O(1)) et une doubly linked list (réorganisation O(1))

class LRUNode<K, V> {
  constructor(
    public key: K,
    public value: V,
    public prev: LRUNode<K, V> | null = null,
    public next: LRUNode<K, V> | null = null,
  ) {}
}

class LRUCache<K, V> {
  private map = new Map<K, LRUNode<K, V>>();
  private head: LRUNode<K, V> | null = null; // most recent
  private tail: LRUNode<K, V> | null = null; // least recent

  constructor(private capacity: number) {}

  get(key: K): V | undefined {
    const node = this.map.get(key);
    if (!node) return undefined;

    // Déplacer en tête (most recently used)
    this.moveToHead(node);
    return node.value;
  }

  put(key: K, value: V): void {
    const existing = this.map.get(key);

    if (existing) {
      existing.value = value;
      this.moveToHead(existing);
      return;
    }

    const node = new LRUNode(key, value);

    if (this.map.size >= this.capacity) {
      // Évincer le moins récemment utilisé (tail)
      const evicted = this.tail!;
      this.removeNode(evicted);
      this.map.delete(evicted.key);
    }

    this.addToHead(node);
    this.map.set(key, node);
  }

  private addToHead(node: LRUNode<K, V>): void {
    node.next = this.head;
    node.prev = null;
    if (this.head) this.head.prev = node;
    this.head = node;
    if (!this.tail) this.tail = node;
  }

  private removeNode(node: LRUNode<K, V>): void {
    if (node.prev) node.prev.next = node.next;
    else this.head = node.next;
    if (node.next) node.next.prev = node.prev;
    else this.tail = node.prev;
  }

  private moveToHead(node: LRUNode<K, V>): void {
    if (node === this.head) return;
    this.removeNode(node);
    this.addToHead(node);
  }
}

// Utilisation — cache de 3 éléments
const cache = new LRUCache<string, string>(3);
cache.put('a', 'Alice');
cache.put('b', 'Bob');
cache.put('c', 'Charlie');
cache.get('a');           // 'Alice' — 'a' redevient le plus récent
cache.put('d', 'Diana');  // Évince 'b' (le moins récemment utilisé)
console.log(cache.get('b')); // undefined — évincé
console.log(cache.get('a')); // 'Alice' — encore là

// Toutes les opérations sont O(1) !
// get → Map.get O(1) + déplacement dans la linked list O(1)
// put → Map.set O(1) + insertion/éviction O(1)
```

---

## 5. Priority Queue (aperçu)

```typescript
// Une priority queue défile par priorité, pas par ordre d'arrivée
// L'implémentation efficace utilise un Heap (module 05)
// Voici une version simple pour l'intuition

class SimplePriorityQueue<T> {
  private items: { value: T; priority: number }[] = [];

  enqueue(value: T, priority: number): void {
    this.items.push({ value, priority });
    // ⚠️ Tri à chaque insertion = O(n log n) — pas optimal
    // Un vrai heap ferait O(log n)
    this.items.sort((a, b) => a.priority - b.priority);
  }

  dequeue(): T | undefined {
    return this.items.shift()?.value;
  }

  peek(): T | undefined {
    return this.items[0]?.value;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

// Utilisation : scheduling de tâches
const pq = new SimplePriorityQueue<string>();
pq.enqueue('tâche A — basse priorité', 10);
pq.enqueue('tâche B — urgente', 1);
pq.enqueue('tâche C — moyenne', 5);

console.log(pq.dequeue()); // 'tâche B — urgente'
console.log(pq.dequeue()); // 'tâche C — moyenne'
console.log(pq.dequeue()); // 'tâche A — basse priorité'
```

---

## 6. Cas terrain fullstack

### 6.1 File de jobs backend

```typescript
// Dans un backend Node.js, tu traites souvent des tâches de manière séquentielle
// Emails à envoyer, webhooks, notifications push, etc.

interface Task {
  type: 'email' | 'webhook' | 'push';
  payload: Record<string, unknown>;
}

const taskQueue = new Queue<Task>();

// L'API reçoit des requêtes et met les tâches en file
function handleRequest(task: Task): void {
  taskQueue.enqueue(task);
  console.log(`📥 ${task.type} en file (${taskQueue.size} pending)`);
}

// Un worker dépile à son rythme
async function worker(): Promise<void> {
  while (!taskQueue.isEmpty()) {
    const task = taskQueue.dequeue()!;
    await processTask(task);
  }
}

async function processTask(task: Task): Promise<void> {
  // Simule un traitement async
  await new Promise(r => setTimeout(r, 100));
  console.log(`✅ ${task.type} traité`);
}
```

### 6.2 Historique utilisateur (undo stack)

```typescript
// Dans un éditeur, formulaire, ou canvas — undo/redo avec stack

interface EditorState {
  content: string;
  cursor: number;
}

const history: EditorState[] = [];
const future: EditorState[] = [];
let current: EditorState = { content: '', cursor: 0 };

function applyChange(newState: EditorState): void {
  history.push(current);
  current = newState;
  future.length = 0; // invalidate redo
}

function undo(): void {
  if (history.length === 0) return;
  future.push(current);
  current = history.pop()!;
}

function redo(): void {
  if (future.length === 0) return;
  history.push(current);
  current = future.pop()!;
}
```

### 6.3 BFS preview (parcours en largeur)

```typescript
// La queue est l'outil fondamental du BFS (Breadth-First Search)
// On verra les graphes en détail au module 07, mais voici l'intuition

// Parcourir un arbre de catégories par niveaux
interface Category {
  name: string;
  children: Category[];
}

function printByLevel(root: Category): void {
  const queue: Category[] = [root];

  while (queue.length > 0) {
    const current = queue.shift()!; // ou utiliser notre Queue correcte
    console.log(current.name);
    for (const child of current.children) {
      queue.push(child);
    }
  }
}

const catalog: Category = {
  name: 'Électronique',
  children: [
    { name: 'Ordinateurs', children: [
      { name: 'Portables', children: [] },
      { name: 'Bureau', children: [] },
    ]},
    { name: 'Audio', children: [
      { name: 'Casques', children: [] },
    ]},
  ],
};

printByLevel(catalog);
// Électronique → Ordinateurs → Audio → Portables → Bureau → Casques
```

---

## Démonstrations

### Demo 1 — Stack vs récursion

```typescript
// Tout ce qui est récursif peut être converti en itératif avec une stack
// Parfois c'est plus performant (pas de risque de stack overflow)

// Version récursive — DFS sur un arbre
function sumRecursive(node: { val: number; children: any[] } | null): number {
  if (!node) return 0;
  let total = node.val;
  for (const child of node.children) {
    total += sumRecursive(child);
  }
  return total;
}

// Version itérative avec stack
function sumIterative(root: { val: number; children: any[] } | null): number {
  if (!root) return 0;
  const stack = [root];
  let total = 0;

  while (stack.length > 0) {
    const node = stack.pop()!;
    total += node.val;
    for (const child of node.children) {
      stack.push(child);
    }
  }

  return total;
}
```

### Demo 2 — Monotonic stack — prochain plus grand élément

```typescript
// Pour chaque élément d'un tableau, trouver le prochain élément plus grand
// Approche brute force : O(n²)
// Monotonic stack : O(n)

function nextGreaterElement(nums: number[]): number[] {
  const result = new Array(nums.length).fill(-1);
  const stack: number[] = []; // indices

  for (let i = 0; i < nums.length; i++) {
    // Tant que l'élément courant est plus grand que le sommet
    while (stack.length > 0 && nums[i] > nums[stack[stack.length - 1]]) {
      const idx = stack.pop()!;
      result[idx] = nums[i];
    }
    stack.push(i);
  }

  return result;
}

console.log(nextGreaterElement([4, 5, 2, 10, 8]));
// [5, 10, 10, -1, -1]
// Pour 4 → prochain plus grand = 5
// Pour 5 → prochain plus grand = 10
// Pour 2 → prochain plus grand = 10
// Pour 10 → aucun = -1
// Pour 8 → aucun = -1
```

### Demo 3 — Queue : traitement par lots (batching)

```typescript
// Scénario : tu reçois des événements un par un mais tu veux
// les traiter par lots de taille N pour optimiser les écritures en BDD

class BatchProcessor<T> {
  private buffer = new Queue<T>();
  private batchSize: number;

  constructor(batchSize: number, private handler: (batch: T[]) => void) {
    this.batchSize = batchSize;
  }

  add(item: T): void {
    this.buffer.enqueue(item);
    if (this.buffer.size >= this.batchSize) {
      this.flush();
    }
  }

  flush(): void {
    const batch: T[] = [];
    while (!this.buffer.isEmpty() && batch.length < this.batchSize) {
      batch.push(this.buffer.dequeue()!);
    }
    if (batch.length > 0) {
      this.handler(batch);
    }
  }
}

const processor = new BatchProcessor<string>(3, batch => {
  console.log('💾 Écriture en BDD :', batch);
});

processor.add('event1');
processor.add('event2');
processor.add('event3'); // → déclenche flush : ['event1', 'event2', 'event3']
processor.add('event4');
processor.add('event5');
processor.flush();       // → flush manuel : ['event4', 'event5']
```

---

## Points clés

1. **Stack** (LIFO) : `push` / `pop` en O(1). Cas : undo, parenthèses, DFS, parsing, navigation de chemins.
2. **Queue** (FIFO) : `enqueue` / `dequeue` en O(1). Cas : BFS, file de jobs, buffers, batching.
3. Ne **jamais** utiliser `Array.shift()` en boucle intensive — c'est O(n) par appel. Utilise une vraie queue.
4. Tout algorithme récursif peut être converti en itératif avec une **stack explicite**.
5. Le **Deque** (double-ended) sert pour des patterns avancés comme le sliding window maximum.
6. La **linked list** n'est presque jamais utilisée seule en JS, mais elle est la base du **LRU cache**.
7. Le **LRU cache** combine `Map` + doubly linked list pour un get/put en O(1).
8. La **priority queue** dépile par priorité — implémentation efficace au module 05 (heap).
9. En production : la queue gère les tâches async, les notifications, les webhooks.
10. La **monotonic stack** résout "prochain plus grand/petit élément" en O(n).

---

## Pour aller plus loin

- [MDN — Array.push/pop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push) — utilisation comme stack
- [Wikipedia — Stack](https://en.wikipedia.org/wiki/Stack_(abstract_data_type)) — fondamentaux
- [JavaScript.info — Recursion and stack](https://javascript.info/recursion) — récursion et pile d'appels
- [Design of a LRU Cache](https://leetcode.com/problems/lru-cache/editorial/) — implémentation détaillée
- [VisuAlgo — Linked list](https://visualgo.net/en/list) — visualisation interactive

---

## Si tu es perdu

1. **Stack** = pile d'assiettes. Dernier posé, premier pris. `push` / `pop`.
2. **Queue** = file au supermarché. Premier arrivé, premier servi. `enqueue` / `dequeue`.
3. `Array.push()` + `Array.pop()` = stack parfaite.
4. `Array.shift()` ≠ queue, c'est trop lent. Utilise l'implémentation avec `head`/`tail`.
5. Si tu ne retiens qu'une chose : la **LRU cache** = Map + linked list, tout en O(1).

---

## Défi

> Implémente un évaluateur de parenthèses `minRemoveToValid(s: string): string` qui retourne la chaîne avec le minimum de parenthèses supprimées pour la rendre valide.
>
> Exemples :
> - `"a(b(c)d"` → `"a(bc)d"` ou `"ab(c)d"`
> - `"))(("` → `""`
> - `"(a(b)c)"` → `"(a(b)c)"`

<details>
<summary>Réponse</summary>

```typescript
function minRemoveToValid(s: string): string {
  const toRemove = new Set<number>();
  const stack: number[] = []; // indices des '(' non fermées

  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') {
      stack.push(i);
    } else if (s[i] === ')') {
      if (stack.length > 0) {
        stack.pop(); // match trouvé
      } else {
        toRemove.add(i); // ')' sans '(' correspondant
      }
    }
  }

  // Les '(' restantes dans la stack n'ont pas de ')' correspondant
  for (const idx of stack) {
    toRemove.add(idx);
  }

  return [...s].filter((_, i) => !toRemove.has(i)).join('');
}

console.log(minRemoveToValid('a(b(c)d')); // 'a(bc)d' ou 'ab(c)d'
console.log(minRemoveToValid('))((')); // ''
console.log(minRemoveToValid('(a(b)c)')); // '(a(b)c)'

// Complexité : O(n) temps, O(n) espace
```

</details>

---

::: tip Parcours recommandé
📖 Module terminé → Fais le **Lab 03** (file de traitement) → puis le **Quiz 03**.
:::
