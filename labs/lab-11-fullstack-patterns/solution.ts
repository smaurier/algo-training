// =============================================================================
// Lab 11 — Patterns Fullstack — Solutions
// =============================================================================
// Exécuter avec : npx tsx solution.ts
// =============================================================================

console.log("=== Lab 11 : Patterns Fullstack — Solutions ===\n");

// =============================================================================
// PARTIE 1 : Debounce & Throttle
// =============================================================================

console.log("--- Partie 1 : Debounce & Throttle ---");

function debounce<T extends (...args: any[]) => void>(fn: T, delayMs: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return ((...args: any[]) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delayMs);
  }) as unknown as T;
}

function throttle<T extends (...args: any[]) => void>(fn: T, intervalMs: number): T {
  let waiting = false;
  return ((...args: any[]) => {
    if (waiting) return;
    fn(...args);
    waiting = true;
    setTimeout(() => { waiting = false; }, intervalMs);
  }) as unknown as T;
}

let debounceCount = 0;
const debouncedFn = debounce(() => { debounceCount++; }, 100);
debouncedFn(); debouncedFn(); debouncedFn();
await new Promise(r => setTimeout(r, 150));
console.log(`Debounce: appelé 3x, exécuté ${debounceCount}x`);

let throttleCount = 0;
const throttledFn = throttle(() => { throttleCount++; }, 100);
throttledFn(); throttledFn(); throttledFn();
await new Promise(r => setTimeout(r, 250));
throttledFn();
console.log(`Throttle: appelé 4x, exécuté ${throttleCount}x`);

// =============================================================================
// PARTIE 2 : LRU Cache avec TTL
// =============================================================================

console.log("\n--- Partie 2 : LRU Cache ---");

class LRUCache<K, V> {
  private cache = new Map<K, { value: V; expiry: number }>();

  constructor(
    private capacity: number,
    private ttlMs: number = Infinity
  ) {}

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return undefined;
    }

    // Rafraîchir la position (delete + set)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) this.cache.delete(key);

    if (this.cache.size >= this.capacity) {
      const oldest = this.cache.keys().next().value!;
      this.cache.delete(oldest);
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + this.ttlMs,
    });
  }

  get size(): number {
    return this.cache.size;
  }
}

const cache = new LRUCache<string, number>(3, 500);
cache.set("a", 1); cache.set("b", 2); cache.set("c", 3);
console.log("get(a):", cache.get("a"));
cache.set("d", 4);
console.log("get(b):", cache.get("b"));
console.log("size:", cache.size);

await new Promise(r => setTimeout(r, 600));
console.log("get(a) après TTL:", cache.get("a"));

// =============================================================================
// PARTIE 3 : Token Bucket Rate Limiter
// =============================================================================

console.log("\n--- Partie 3 : Token Bucket ---");

class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private capacity: number,
    private refillRate: number
  ) {
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  tryConsume(tokens: number = 1): boolean {
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

  get available(): number {
    this.refill();
    return Math.floor(this.tokens);
  }
}

const bucket = new TokenBucket(5, 2);
console.log("consume 1:", bucket.tryConsume(1));
console.log("consume 3:", bucket.tryConsume(3));
console.log("available:", bucket.available);
console.log("consume 3:", bucket.tryConsume(3));

// =============================================================================
// PARTIE BONUS : Cursor Pagination
// =============================================================================

console.log("\n--- Bonus : Cursor Pagination ---");

interface PaginatedResult<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

function paginateCursor<T extends { id: number }>(
  items: T[],
  cursor: string | null,
  limit: number
): PaginatedResult<T> {
  let startIndex = 0;

  if (cursor) {
    const cursorId = Number(atob(cursor));
    startIndex = items.findIndex(item => item.id === cursorId) + 1;
    if (startIndex === 0) startIndex = items.length; // cursor invalide
  }

  const data = items.slice(startIndex, startIndex + limit);
  const hasMore = startIndex + limit < items.length;
  const nextCursor = data.length > 0 ? btoa(String(data[data.length - 1].id)) : null;

  return { data, nextCursor: hasMore ? nextCursor : null, hasMore };
}

const products = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
}));

let page = paginateCursor(products, null, 5);
console.log("Page 1:", page.data.map(p => p.name), "hasMore:", page.hasMore);

page = paginateCursor(products, page.nextCursor, 5);
console.log("Page 2:", page.data.map(p => p.name), "hasMore:", page.hasMore);

console.log("\n=== Fin du Lab 11 ===");
