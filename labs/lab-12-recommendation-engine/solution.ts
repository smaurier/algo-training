// =============================================================================
// Lab 12 — Moteur de recommandation — Solutions
// =============================================================================
// Exécuter avec : npx tsx solution.ts
// =============================================================================

console.log("=== Lab 12 : Moteur de recommandation — Solutions ===\n");

// =============================================================================
// Données
// =============================================================================

interface Product {
  id: string;
  name: string;
  tags: string[];
  price: number;
  popularity: number;
}

const catalog: Product[] = [
  { id: "p1", name: "MacBook Pro", tags: ["laptop", "apple", "pro", "portable"], price: 2499, popularity: 95 },
  { id: "p2", name: "MacBook Air", tags: ["laptop", "apple", "light", "portable"], price: 1299, popularity: 90 },
  { id: "p3", name: "ThinkPad X1", tags: ["laptop", "lenovo", "pro", "portable"], price: 1899, popularity: 80 },
  { id: "p4", name: "iPad Pro", tags: ["tablet", "apple", "pro", "portable"], price: 1099, popularity: 85 },
  { id: "p5", name: "Surface Pro", tags: ["tablet", "microsoft", "pro", "portable"], price: 999, popularity: 70 },
  { id: "p6", name: "AirPods Pro", tags: ["audio", "apple", "wireless"], price: 249, popularity: 92 },
  { id: "p7", name: "Sony WH-1000", tags: ["audio", "sony", "wireless", "pro"], price: 349, popularity: 88 },
  { id: "p8", name: "Magic Mouse", tags: ["accessory", "apple", "wireless"], price: 99, popularity: 60 },
  { id: "p9", name: "Dell XPS 15", tags: ["laptop", "dell", "pro", "portable"], price: 1799, popularity: 82 },
  { id: "p10", name: "Galaxy Tab", tags: ["tablet", "samsung", "portable"], price: 649, popularity: 65 },
];

// =============================================================================
// PARTIE 1 : ProductIndex
// =============================================================================

console.log("--- Partie 1 : ProductIndex ---");

class TrieNode {
  children = new Map<string, TrieNode>();
  productIds = new Set<string>();
}

class ProductIndex {
  private trie = new TrieNode();
  private byTag = new Map<string, Set<string>>();
  private byId = new Map<string, Product>();

  addProduct(product: Product): void {
    this.byId.set(product.id, product);

    // Trie insertion
    const name = product.name.toLowerCase();
    let node = this.trie;
    for (const ch of name) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
      node = node.children.get(ch)!;
      node.productIds.add(product.id);
    }

    // Tag index
    for (const tag of product.tags) {
      if (!this.byTag.has(tag)) this.byTag.set(tag, new Set());
      this.byTag.get(tag)!.add(product.id);
    }
  }

  getProduct(id: string): Product | undefined {
    return this.byId.get(id);
  }

  searchByPrefix(prefix: string): Product[] {
    let node = this.trie;
    for (const ch of prefix.toLowerCase()) {
      if (!node.children.has(ch)) return [];
      node = node.children.get(ch)!;
    }
    return [...node.productIds].map(id => this.byId.get(id)!);
  }

  searchByTag(tag: string): Product[] {
    const ids = this.byTag.get(tag);
    if (!ids) return [];
    return [...ids].map(id => this.byId.get(id)!);
  }
}

const index = new ProductIndex();
catalog.forEach(p => index.addProduct(p));

console.log("Prefix 'mac':", index.searchByPrefix("mac").map(p => p.name));
console.log("Tag 'apple':", index.searchByTag("apple").map(p => p.name));

// =============================================================================
// PARTIE 2 : Graphe de similarité
// =============================================================================

console.log("\n--- Partie 2 : Graphe de similarité ---");

function jaccardSimilarity(tags1: string[], tags2: string[]): number {
  const set1 = new Set(tags1);
  const set2 = new Set(tags2);
  let intersection = 0;
  for (const t of set1) if (set2.has(t)) intersection++;
  const union = new Set([...tags1, ...tags2]).size;
  return union === 0 ? 0 : intersection / union;
}

function buildSimilarityGraph(products: Product[], threshold = 0.2): Map<string, Map<string, number>> {
  const graph = new Map<string, Map<string, number>>();
  for (const p of products) graph.set(p.id, new Map());

  for (let i = 0; i < products.length; i++) {
    for (let j = i + 1; j < products.length; j++) {
      const sim = jaccardSimilarity(products[i].tags, products[j].tags);
      if (sim >= threshold) {
        graph.get(products[i].id)!.set(products[j].id, sim);
        graph.get(products[j].id)!.set(products[i].id, sim);
      }
    }
  }

  return graph;
}

const simGraph = buildSimilarityGraph(catalog);
console.log("Voisins de MacBook Pro:");
const neighbors = simGraph.get("p1");
if (neighbors) {
  for (const [id, sim] of neighbors) {
    const p = catalog.find(p => p.id === id);
    console.log(`  ${p?.name}: ${(sim * 100).toFixed(0)}%`);
  }
}

// =============================================================================
// LRU Cache
// =============================================================================

class LRUCache<K, V> {
  private cache = new Map<K, { value: V; expiry: number }>();
  constructor(private capacity: number, private ttlMs: number = 30000) {}

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiry) { this.cache.delete(key); return undefined; }
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) this.cache.delete(key);
    if (this.cache.size >= this.capacity) {
      this.cache.delete(this.cache.keys().next().value!);
    }
    this.cache.set(key, { value, expiry: Date.now() + this.ttlMs });
  }
}

// =============================================================================
// MinHeap
// =============================================================================

class MinHeap<T> {
  private heap: T[] = [];
  constructor(private cmp: (a: T, b: T) => number) {}

  push(val: T) {
    this.heap.push(val);
    let i = this.heap.length - 1;
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (this.cmp(this.heap[i], this.heap[p]) >= 0) break;
      [this.heap[i], this.heap[p]] = [this.heap[p], this.heap[i]];
      i = p;
    }
  }

  pop(): T | undefined {
    if (!this.heap.length) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length) {
      this.heap[0] = last;
      let i = 0;
      while (true) {
        let s = i, l = 2*i+1, r = 2*i+2;
        if (l < this.heap.length && this.cmp(this.heap[l], this.heap[s]) < 0) s = l;
        if (r < this.heap.length && this.cmp(this.heap[r], this.heap[s]) < 0) s = r;
        if (s === i) break;
        [this.heap[i], this.heap[s]] = [this.heap[s], this.heap[i]];
        i = s;
      }
    }
    return top;
  }

  peek(): T | undefined { return this.heap[0]; }
  get size() { return this.heap.length; }
}

// =============================================================================
// PARTIE 3 : Recommendation Engine
// =============================================================================

console.log("\n--- Partie 3 : Recommendation Engine ---");

interface Recommendation {
  product: Product;
  score: number;
  reasons: string[];
}

class RecommendationEngine {
  private index: ProductIndex;
  private graph: Map<string, Map<string, number>>;
  private cache = new LRUCache<string, Recommendation[]>(50, 60000);

  constructor(private products: Product[]) {
    this.index = new ProductIndex();
    products.forEach(p => this.index.addProduct(p));
    this.graph = buildSimilarityGraph(products);
  }

  recommend(productId: string, k: number = 5): Recommendation[] {
    const cacheKey = `${productId}:${k}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const source = this.index.getProduct(productId);
    if (!source) return [];

    const neighbors = this.graph.get(productId);
    if (!neighbors) return [];

    // MinHeap de taille K (min score en haut)
    const heap = new MinHeap<Recommendation>((a, b) => a.score - b.score);

    for (const [neighborId, similarity] of neighbors) {
      const product = this.index.getProduct(neighborId)!;
      const priceSim = 1 - Math.abs(source.price - product.price) / Math.max(source.price, product.price);
      const score = 0.5 * similarity + 0.3 * (product.popularity / 100) + 0.2 * priceSim;

      const reasons: string[] = [];
      const commonTags = source.tags.filter(t => product.tags.includes(t));
      if (commonTags.length) reasons.push(`Tags communs: ${commonTags.join(", ")}`);
      if (product.popularity >= 80) reasons.push(`Populaire (${product.popularity}/100)`);

      const rec: Recommendation = { product, score, reasons };

      if (heap.size < k) {
        heap.push(rec);
      } else if (score > heap.peek()!.score) {
        heap.pop();
        heap.push(rec);
      }
    }

    const result: Recommendation[] = [];
    while (heap.size > 0) result.push(heap.pop()!);
    result.reverse(); // Du meilleur au moins bon

    this.cache.set(cacheKey, result);
    return result;
  }

  recommendPaginated(productId: string, cursor: string | null, limit: number) {
    const all = this.recommend(productId, 100);
    let startIndex = 0;

    if (cursor) {
      const cursorId = atob(cursor);
      startIndex = all.findIndex(r => r.product.id === cursorId) + 1;
    }

    const data = all.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < all.length;
    const nextCursor = data.length > 0 && hasMore
      ? btoa(data[data.length - 1].product.id)
      : null;

    return { data, nextCursor, hasMore };
  }
}

const engine = new RecommendationEngine(catalog);
const recs = engine.recommend("p1", 3);
console.log("\nRecommandations pour MacBook Pro:");
recs.forEach((r, i) => {
  console.log(`  ${i + 1}. ${r.product.name} (score: ${r.score.toFixed(2)}) — ${r.reasons.join("; ")}`);
});

// =============================================================================
// PARTIE BONUS : Pagination
// =============================================================================

console.log("\n--- Bonus : Pagination ---");

let page = engine.recommendPaginated("p1", null, 2);
console.log("Page 1:", page.data.map(r => r.product.name), "hasMore:", page.hasMore);

if (page.nextCursor) {
  page = engine.recommendPaginated("p1", page.nextCursor, 2);
  console.log("Page 2:", page.data.map(r => r.product.name), "hasMore:", page.hasMore);
}

console.log("\n=== Fin du Lab 12 ===");
