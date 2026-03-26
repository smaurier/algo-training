# Module 11 — Patterns algorithmiques pour le JS fullstack

> **Objectif** : maîtriser les patterns algorithmiques spécifiques au développement fullstack JavaScript/TypeScript : debounce/throttle, pagination curseur, diff de virtual DOM, workers, streaming, event sourcing.

> **Difficulté** : ⭐⭐⭐

::: info Pas de panique !
Ce module fait le pont entre la théorie algorithmique et la pratique quotidienne du développeur fullstack. Chaque section résout un problème concret que tu rencontreras en production.
:::

---

## Prérequis

- Modules 01-03 (complexité, tableaux, hash maps)
- Connaissance de base en JavaScript async (Promises, setTimeout)

---

## 1. Debounce et Throttle

### 1.1 Debounce — attendre la fin de l'activité

```typescript
// Debounce : exécuter la fonction SEULEMENT après un délai d'inactivité
// Cas : recherche en temps réel, resize, scroll, auto-save

function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number,
): T & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced as T & { cancel: () => void };
}

// Utilisation React-like
const searchAPI = debounce((query: string) => {
  console.log(`Searching: ${query}`);
}, 300);

// Tapé rapidement : "h", "he", "hel", "hell", "hello"
// → Un seul appel API : "hello" (après 300ms d'inactivité)
```

### 1.2 Throttle — limiter la fréquence

```typescript
// Throttle : exécuter au maximum une fois tous les N ms
// Cas : scroll handler, mouse move, websocket messages

function throttle<T extends (...args: any[]) => void>(
  fn: T,
  limit: number,
): T {
  let lastRun = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return ((...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastRun >= limit) {
      fn(...args);
      lastRun = now;
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        fn(...args);
        lastRun = Date.now();
        timeoutId = null;
      }, limit - (now - lastRun));
    }
  }) as T;
}

const handleScroll = throttle(() => {
  console.log('Scroll position:', 0); // window.scrollY en vrai
}, 100);
```

### 1.3 Comparaison

```
Timeline : événements (|) et exécutions (*)

Debounce (300ms) :
    | | | | |                 | |
                    *                   *
    attends...      feu!    attends..   feu!

Throttle (300ms) :
    | | | | | | | | | |
    *       *       *      *
    max 1 exécution tous les 300ms
```

---

## 2. Pagination par curseur

### 2.1 Pourquoi pas offset/limit ?

```
Offset/Limit : SELECT * FROM users LIMIT 10 OFFSET 1000
Problèmes :
- O(n) : la DB doit scanner 1000 lignes pour les ignorer
- Données dupliquées/manquantes si des lignes sont insérées/supprimées entre les pages
- Performance qui se dégrade avec les pages éloignées

Curseur : SELECT * FROM users WHERE id > :lastId ORDER BY id LIMIT 10
Avantages :
- O(1) grâce à l'index
- Résultats stables même si les données changent
- Performance constante quelle que soit la page
```

### 2.2 Implémentation

```typescript
interface CursorPage<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

// Encodage du curseur (base64 de l'ID)
function encodeCursor(id: string | number): string {
  return Buffer.from(String(id)).toString('base64');
}

function decodeCursor(cursor: string): string {
  return Buffer.from(cursor, 'base64').toString('utf8');
}

// Simulation de pagination curseur sur un tableau
function paginateCursor<T extends { id: string }>(
  items: T[],
  cursor: string | null,
  limit: number,
): CursorPage<T> {
  let startIndex = 0;

  if (cursor) {
    const lastId = decodeCursor(cursor);
    startIndex = items.findIndex(item => item.id === lastId) + 1;
  }

  const page = items.slice(startIndex, startIndex + limit);
  const hasMore = startIndex + limit < items.length;

  return {
    data: page,
    nextCursor: hasMore ? encodeCursor(page[page.length - 1].id) : null,
    hasMore,
  };
}

// Utilisation
const users = Array.from({ length: 100 }, (_, i) => ({
  id: `user-${i}`,
  name: `User ${i}`,
}));

const page1 = paginateCursor(users, null, 10);
console.log(page1.data.length); // 10
console.log(page1.hasMore);     // true

const page2 = paginateCursor(users, page1.nextCursor, 10);
console.log(page2.data[0].id);  // 'user-10'
```

---

## 3. Virtual DOM Diff simplifié

```typescript
// Le cœur de React : comparer deux arbres et produire le minimum de patches

interface VNode {
  type: string;
  props: Record<string, any>;
  children: (VNode | string)[];
}

type Patch =
  | { type: 'REPLACE'; node: VNode | string }
  | { type: 'PROPS'; changes: Record<string, any> }
  | { type: 'TEXT'; text: string }
  | { type: 'REORDER'; moves: Array<{ type: 'INSERT' | 'REMOVE'; index: number }> };

function diff(
  oldNode: VNode | string | undefined,
  newNode: VNode | string | undefined,
): Patch | null {
  // Nœud supprimé
  if (newNode === undefined) return null;

  // Nœud ajouté ou types différents
  if (oldNode === undefined || typeof oldNode !== typeof newNode) {
    return { type: 'REPLACE', node: newNode as VNode | string };
  }

  // Texte
  if (typeof oldNode === 'string' && typeof newNode === 'string') {
    return oldNode !== newNode ? { type: 'TEXT', text: newNode } : null;
  }

  // VNode — comparer le type
  if (typeof oldNode === 'object' && typeof newNode === 'object') {
    if (oldNode.type !== newNode.type) {
      return { type: 'REPLACE', node: newNode };
    }

    // Comparer les props
    const propChanges: Record<string, any> = {};
    let hasChanges = false;

    for (const key of new Set([...Object.keys(oldNode.props), ...Object.keys(newNode.props)])) {
      if (oldNode.props[key] !== newNode.props[key]) {
        propChanges[key] = newNode.props[key] ?? null;
        hasChanges = true;
      }
    }

    return hasChanges ? { type: 'PROPS', changes: propChanges } : null;
  }

  return null;
}

// Simplifié — React utilise un algo O(n) basé sur les keys pour les listes
```

---

## 4. LRU Cache avec TTL

```typescript
// Extension du LRU Cache du module 03 avec expiration

class LRUCacheWithTTL<K, V> {
  private cache = new Map<K, { value: V; expiresAt: number }>();
  private capacity: number;
  private defaultTTL: number;

  constructor(capacity: number, defaultTTLMs: number) {
    this.capacity = capacity;
    this.defaultTTL = defaultTTLMs;
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // Vérifier l'expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  set(key: K, value: V, ttlMs?: number): void {
    this.cache.delete(key); // Supprime si existant

    if (this.cache.size >= this.capacity) {
      // Supprimer le plus ancien (premier de la Map)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + (ttlMs ?? this.defaultTTL),
    });
  }

  get size(): number {
    // Purger les expirés
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) this.cache.delete(key);
    }
    return this.cache.size;
  }
}

const cache = new LRUCacheWithTTL<string, object>(100, 60_000); // 100 items, 60s TTL
cache.set('user:123', { name: 'Alice' });
console.log(cache.get('user:123')); // { name: 'Alice' }
```

---

## 5. Traitement de flux (Streaming)

```typescript
// Pattern : traiter les données au fil de l'eau plutôt qu'en mémoire

// 5.1 Sliding window sur un flux
class SlidingWindowAverage {
  private window: number[] = [];
  private sum = 0;

  constructor(private size: number) {}

  add(value: number): number {
    this.window.push(value);
    this.sum += value;

    if (this.window.length > this.size) {
      this.sum -= this.window.shift()!;
    }

    return this.sum / this.window.length;
  }
}

const avg = new SlidingWindowAverage(3);
console.log(avg.add(10)); // 10
console.log(avg.add(20)); // 15
console.log(avg.add(30)); // 20
console.log(avg.add(40)); // 30 (window: [20, 30, 40])

// 5.2 Generator pour le streaming
function* batchIterator<T>(items: T[], batchSize: number): Generator<T[]> {
  for (let i = 0; i < items.length; i += batchSize) {
    yield items.slice(i, i + batchSize);
  }
}

// Traitement par batch
async function processBatches<T>(
  items: T[],
  batchSize: number,
  processor: (batch: T[]) => Promise<void>,
): Promise<void> {
  for (const batch of batchIterator(items, batchSize)) {
    await processor(batch);
  }
}

// Utilisation
const allUsers = Array.from({ length: 10000 }, (_, i) => ({ id: i }));
await processBatches(allUsers, 100, async (batch) => {
  console.log(`Processing ${batch.length} users...`);
  // await db.insertMany(batch);
});
```

---

## 6. Event Sourcing — stocker les événements

```typescript
// Au lieu de stocker l'état final, stocker les événements qui y mènent
// Le state courant = réduction de tous les événements

interface Event {
  type: string;
  payload: any;
  timestamp: number;
}

class EventStore<TState> {
  private events: Event[] = [];

  constructor(
    private initialState: TState,
    private reducer: (state: TState, event: Event) => TState,
  ) {}

  dispatch(type: string, payload: any): void {
    this.events.push({ type, payload, timestamp: Date.now() });
  }

  getState(): TState {
    return this.events.reduce(
      (state, event) => this.reducer(state, event),
      structuredClone(this.initialState),
    );
  }

  // Reconstituer l'état à un moment donné (time travel !)
  getStateAt(timestamp: number): TState {
    return this.events
      .filter(e => e.timestamp <= timestamp)
      .reduce(
        (state, event) => this.reducer(state, event),
        structuredClone(this.initialState),
      );
  }

  // Historique pour audit
  getHistory(): Event[] {
    return [...this.events];
  }
}

// Exemple : panier e-commerce
interface CartState { items: Map<string, number>; total: number }

const cart = new EventStore<CartState>(
  { items: new Map(), total: 0 },
  (state, event) => {
    switch (event.type) {
      case 'ADD_ITEM': {
        const { productId, price } = event.payload;
        state.items.set(productId, (state.items.get(productId) ?? 0) + 1);
        state.total += price;
        return state;
      }
      case 'REMOVE_ITEM': {
        const { productId, price } = event.payload;
        const qty = state.items.get(productId) ?? 0;
        if (qty > 1) state.items.set(productId, qty - 1);
        else state.items.delete(productId);
        state.total -= price;
        return state;
      }
      default:
        return state;
    }
  },
);

cart.dispatch('ADD_ITEM', { productId: 'shoe-1', price: 120 });
cart.dispatch('ADD_ITEM', { productId: 'shirt-1', price: 45 });
cart.dispatch('ADD_ITEM', { productId: 'shoe-1', price: 120 });

console.log(cart.getState());
// { items: Map { 'shoe-1' => 2, 'shirt-1' => 1 }, total: 285 }
```

---

## 7. Rate Limiter (Token Bucket)

```typescript
// Limiter le nombre de requêtes par période — essentiel en API

class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private capacity: number,
    private refillRate: number, // tokens par seconde
  ) {
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  tryConsume(tokens = 1): boolean {
    this.refill();

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }

    return false;
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }
}

const limiter = new TokenBucket(10, 2); // 10 max, recharge 2/sec

// Simuler des requêtes rapides
for (let i = 0; i < 15; i++) {
  console.log(`Request ${i}: ${limiter.tryConsume() ? 'OK' : 'RATE LIMITED'}`);
}
// Les 10 premières passent, les 5 suivantes sont limitées
```

---

## 8. Consistent Hashing (preview)

```typescript
// Distribuer des clés sur des serveurs, minimiser la redistribution
// quand on ajoute/supprime un serveur

class ConsistentHash {
  private ring = new Map<number, string>(); // position → server
  private sortedKeys: number[] = [];

  constructor(
    private replicas: number = 3, // nœuds virtuels par serveur
  ) {}

  private hash(key: string): number {
    // Hash simplifié (en production : MD5 ou murmur3)
    let h = 0;
    for (const char of key) {
      h = ((h << 5) - h + char.charCodeAt(0)) | 0;
    }
    return Math.abs(h);
  }

  addServer(server: string): void {
    for (let i = 0; i < this.replicas; i++) {
      const pos = this.hash(`${server}:${i}`);
      this.ring.set(pos, server);
      this.sortedKeys.push(pos);
    }
    this.sortedKeys.sort((a, b) => a - b);
  }

  getServer(key: string): string | undefined {
    if (this.sortedKeys.length === 0) return undefined;

    const h = this.hash(key);
    // Trouver le premier serveur avec position >= hash (binary search)
    for (const pos of this.sortedKeys) {
      if (pos >= h) return this.ring.get(pos);
    }
    return this.ring.get(this.sortedKeys[0]); // Wrap around
  }
}

const ch = new ConsistentHash();
ch.addServer('server-1');
ch.addServer('server-2');
ch.addServer('server-3');

console.log(ch.getServer('user:alice'));
console.log(ch.getServer('user:bob'));
console.log(ch.getServer('session:123'));
```

---

## Points clés

1. **Debounce** = attendre l'inactivité. **Throttle** = limiter la fréquence.
2. **Cursor pagination** > offset pagination pour les grandes listes.
3. **Virtual DOM diff** = comparer deux arbres en O(n) grâce aux keys.
4. **LRU + TTL** = cache avec éviction par utilisation ET par temps.
5. **Streaming/batch** = traiter les données par morceaux, pas tout en mémoire.
6. **Event sourcing** = stocker les événements, reconstruire l'état (time travel).
7. **Token bucket** = rate limiting standard pour les API.
8. **Consistent hashing** = distribution de charge résiliente.
9. Ces patterns sont les **building blocks** de toute architecture web moderne.

---

## Pour aller plus loin

- [web.dev — Debouncing and Throttling](https://web.dev/debouncing-and-throttling/) — guide officiel
- [cursor.dev — Cursor Pagination](https://relay.dev/graphql/connections.htm) — spécification Relay
- [Martin Fowler — Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html) — le concept expliqué
- [Wikipedia — Token bucket](https://en.wikipedia.org/wiki/Token_bucket) — algorithme détaillé

---

## Si tu es perdu

1. Debounce = attendre que l'utilisateur arrête de taper.
2. Pagination curseur = « donne-moi les 10 suivants après ce repère ».
3. Event sourcing = journal de toutes les actions (comme Git).
4. Rate limiter = « pas plus de X requêtes par seconde ».
5. Chaque pattern résout un problème de performance ou de fiabilité concret.

---

## Défi

> Implémente un **RequestDeduplicator** : quand plusieurs composants appellent la même API en même temps, une seule requête est envoyée et tous les appelants reçoivent la même réponse. C'est le pattern utilisé par SWR et React Query.

<details>
<summary>Réponse</summary>

```typescript
class RequestDeduplicator {
  private pending = new Map<string, Promise<any>>();

  async fetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // Si une requête identique est déjà en cours, réutiliser sa Promise
    if (this.pending.has(key)) {
      return this.pending.get(key)!;
    }

    const promise = fetcher().finally(() => {
      this.pending.delete(key);
    });

    this.pending.set(key, promise);
    return promise;
  }
}

const dedup = new RequestDeduplicator();

// Trois appels simultanés → une seule vraie requête
const [r1, r2, r3] = await Promise.all([
  dedup.fetch('users', () => fetch('/api/users').then(r => r.json())),
  dedup.fetch('users', () => fetch('/api/users').then(r => r.json())),
  dedup.fetch('users', () => fetch('/api/users').then(r => r.json())),
]);

// r1 === r2 === r3 (même objet/résultat)
```

</details>

---

::: tip Parcours recommandé
📖 Module terminé → Fais le **Lab 11** (patterns en situation) → puis le **Quiz 11**.
:::
