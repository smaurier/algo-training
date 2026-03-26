# Module 12 — Projet final : moteur de recommandation

> **Objectif** : combiner tous les acquis du cours dans un projet concret — construire un moteur de recommandation de produits qui utilise des graphes, du hashing, du tri, de la recherche, du caching et de la pagination.

> **Difficulté** : ⭐⭐⭐⭐⭐

::: info Pas de panique !
Ce projet final est un fil rouge qui combine les techniques de tous les modules précédents. Tu ne vas pas tout implémenter d'un coup — chaque partie est indépendante et tu peux les aborder dans l'ordre que tu veux. L'important est de voir comment les algorithmes s'assemblent dans un système réel.
:::

---

## Prérequis

- Tous les modules précédents (0-11)
- Familiarité avec TypeScript et Node.js

---

## 1. Vue d'ensemble du projet

```
┌──────────────────────────────────────────────────────────────────┐
│                  MOTEUR DE RECOMMANDATION                        │
│                                                                  │
│  ┌─────────┐   ┌──────────┐   ┌──────────┐   ┌──────────────┐  │
│  │ Données  │──→│ Indexation│──→│ Recherche│──→│ Recommandation│  │
│  │ Produits │   │ Trie+Map │   │ BFS+Score│   │ Graph+Sort   │  │
│  └─────────┘   └──────────┘   └──────────┘   └──────────────┘  │
│       │                                              │          │
│       ▼                                              ▼          │
│  ┌─────────┐                                  ┌──────────┐      │
│  │ Cache    │                                  │ Pagination│      │
│  │ LRU+TTL │                                  │ Cursor    │      │
│  └─────────┘                                  └──────────┘      │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Modèle de données

```typescript
interface Product {
  id: string;
  name: string;
  category: string;
  tags: string[];
  price: number;
  rating: number;
  salesCount: number;
}

interface User {
  id: string;
  name: string;
  viewedProducts: string[];    // product IDs
  purchasedProducts: string[]; // product IDs
  preferences: string[];       // tags
}

// Données de test
const products: Product[] = [
  { id: 'p1', name: 'MacBook Pro', category: 'laptops', tags: ['apple', 'portable', 'pro'], price: 2499, rating: 4.8, salesCount: 15000 },
  { id: 'p2', name: 'ThinkPad X1', category: 'laptops', tags: ['lenovo', 'portable', 'business'], price: 1899, rating: 4.6, salesCount: 8000 },
  { id: 'p3', name: 'Magic Mouse', category: 'accessories', tags: ['apple', 'peripherals'], price: 99, rating: 3.5, salesCount: 25000 },
  { id: 'p4', name: 'AirPods Pro', category: 'audio', tags: ['apple', 'wireless', 'pro'], price: 249, rating: 4.7, salesCount: 50000 },
  { id: 'p5', name: 'Sony WH-1000', category: 'audio', tags: ['sony', 'wireless', 'noise-cancel'], price: 349, rating: 4.8, salesCount: 30000 },
  { id: 'p6', name: 'iPad Air', category: 'tablets', tags: ['apple', 'portable'], price: 599, rating: 4.6, salesCount: 20000 },
  { id: 'p7', name: 'Galaxy Tab S9', category: 'tablets', tags: ['samsung', 'portable', 'android'], price: 449, rating: 4.4, salesCount: 12000 },
  { id: 'p8', name: 'Dell Monitor', category: 'monitors', tags: ['dell', 'display', 'pro'], price: 699, rating: 4.5, salesCount: 10000 },
];
```

---

## 3. PARTIE A — Index de recherche (Trie + HashMap)

```typescript
// Module 10 : Trie pour l'autocomplétion
// Module 02 : HashMap pour l'index inversé

class ProductIndex {
  private trie: Trie;
  private byId: Map<string, Product>;
  private byTag: Map<string, Set<string>>;     // tag → product IDs
  private byCategory: Map<string, Set<string>>; // category → product IDs

  constructor(products: Product[]) {
    this.trie = new Trie();
    this.byId = new Map();
    this.byTag = new Map();
    this.byCategory = new Map();

    for (const product of products) {
      this.indexProduct(product);
    }
  }

  private indexProduct(product: Product): void {
    this.byId.set(product.id, product);

    // Indexer le nom dans le Trie (mots séparés)
    const words = product.name.toLowerCase().split(/\s+/);
    for (const word of words) {
      this.trie.insert(word);
    }

    // Index inversé par tag
    for (const tag of product.tags) {
      if (!this.byTag.has(tag)) this.byTag.set(tag, new Set());
      this.byTag.get(tag)!.add(product.id);
    }

    // Index par catégorie
    if (!this.byCategory.has(product.category)) {
      this.byCategory.set(product.category, new Set());
    }
    this.byCategory.get(product.category)!.add(product.id);
  }

  // Autocomplétion — O(prefix + résultats)
  autocomplete(prefix: string): string[] {
    return this.trie.autocomplete(prefix.toLowerCase());
  }

  // Recherche par tag — O(1)
  findByTag(tag: string): Product[] {
    const ids = this.byTag.get(tag) ?? new Set();
    return [...ids].map(id => this.byId.get(id)!);
  }

  // Recherche par catégorie — O(1)
  findByCategory(category: string): Product[] {
    const ids = this.byCategory.get(category) ?? new Set();
    return [...ids].map(id => this.byId.get(id)!);
  }

  getById(id: string): Product | undefined {
    return this.byId.get(id);
  }
}

// Utilisation
class Trie {
  // Réutiliser l'implémentation du module 10
  private root: { children: Map<string, any>; isEnd: boolean } = { children: new Map(), isEnd: false };

  insert(word: string): void {
    let node = this.root;
    for (const char of word) {
      if (!node.children.has(char)) node.children.set(char, { children: new Map(), isEnd: false });
      node = node.children.get(char)!;
    }
    node.isEnd = true;
  }

  autocomplete(prefix: string, limit = 10): string[] {
    let node = this.root;
    for (const char of prefix) {
      if (!node.children.has(char)) return [];
      node = node.children.get(char)!;
    }
    const results: string[] = [];
    this.collect(node, prefix, results, limit);
    return results;
  }

  private collect(node: any, prefix: string, results: string[], limit: number): void {
    if (results.length >= limit) return;
    if (node.isEnd) results.push(prefix);
    for (const [char, child] of node.children) {
      this.collect(child, prefix + char, results, limit);
    }
  }
}

const index = new ProductIndex(products);
console.log(index.autocomplete('mac'));        // ['macbook']
console.log(index.findByTag('apple').map(p => p.name));
// ['MacBook Pro', 'Magic Mouse', 'AirPods Pro', 'iPad Air']
```

---

## 4. PARTIE B — Graphe de similarité

```typescript
// Module 07 : graphe de produits similaires
// Deux produits sont similaires s'ils partagent des tags ou une catégorie

type SimilarityGraph = Map<string, Map<string, number>>; // productId → (productId → score)

function buildSimilarityGraph(products: Product[]): SimilarityGraph {
  const graph: SimilarityGraph = new Map();

  for (const product of products) {
    graph.set(product.id, new Map());
  }

  // Calculer la similarité entre chaque paire
  for (let i = 0; i < products.length; i++) {
    for (let j = i + 1; j < products.length; j++) {
      const a = products[i];
      const b = products[j];

      // Score de similarité basé sur les tags communs
      const tagsA = new Set(a.tags);
      const tagsB = new Set(b.tags);
      const commonTags = [...tagsA].filter(t => tagsB.has(t)).length;

      // Bonus si même catégorie
      const categoryBonus = a.category === b.category ? 2 : 0;

      const score = commonTags + categoryBonus;

      if (score > 0) {
        graph.get(a.id)!.set(b.id, score);
        graph.get(b.id)!.set(a.id, score);
      }
    }
  }

  return graph;
}

// Trouver les N produits les plus similaires — O(voisins × log N)
// Module 05 : on pourrait utiliser un MinHeap pour le top-N
function topSimilar(
  graph: SimilarityGraph,
  productId: string,
  n: number,
): Array<{ id: string; score: number }> {
  const neighbors = graph.get(productId);
  if (!neighbors) return [];

  return [...neighbors.entries()]
    .map(([id, score]) => ({ id, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}

const simGraph = buildSimilarityGraph(products);
console.log(topSimilar(simGraph, 'p1', 3));
// Top 3 similaires au MacBook Pro : iPad Air (apple+portable), ThinkPad (laptops), etc.
```

---

## 5. PARTIE C — Scoring et tri des recommandations

```typescript
// Module 05 : tri multi-critères
// Module 02 : HashMap pour le scoring

interface RecommendationScore {
  productId: string;
  similarityScore: number;   // depuis le graphe
  popularityScore: number;   // basé sur les ventes
  relevanceScore: number;    // basé sur les préférences user
  totalScore: number;
}

function scoreRecommendations(
  user: User,
  candidates: Product[],
  graph: SimilarityGraph,
): RecommendationScore[] {
  // Tags préférés de l'utilisateur (basé sur produits vus/achetés)
  const preferredTags = new Set(user.preferences);

  // Produits vus récemment → source de similarité
  const recentlyViewed = new Set(user.viewedProducts.slice(-5));
  const purchased = new Set(user.purchasedProducts);

  return candidates
    .filter(p => !purchased.has(p.id)) // Exclure les déjà achetés
    .map(product => {
      // Score de similarité avec les produits vus
      let similarityScore = 0;
      for (const viewedId of recentlyViewed) {
        similarityScore += graph.get(viewedId)?.get(product.id) ?? 0;
      }

      // Score de popularité (normaliser sur 0-10)
      const maxSales = Math.max(...candidates.map(p => p.salesCount));
      const popularityScore = (product.salesCount / maxSales) * 10;

      // Score de pertinence (tags matching)
      const matchingTags = product.tags.filter(t => preferredTags.has(t)).length;
      const relevanceScore = matchingTags * 3; // 3 points par tag match

      const totalScore =
        similarityScore * 2 +     // poids : similarité
        popularityScore * 1 +      // poids : popularité
        relevanceScore * 1.5 +     // poids : pertinence
        product.rating * 2;        // poids : rating

      return {
        productId: product.id,
        similarityScore,
        popularityScore,
        relevanceScore,
        totalScore,
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore); // Tri décroissant — O(n log n)
}

// Utilisation
const user: User = {
  id: 'u1',
  name: 'Alice',
  viewedProducts: ['p1', 'p4'], // MacBook Pro, AirPods Pro
  purchasedProducts: ['p1'],     // Déjà acheté MacBook
  preferences: ['apple', 'pro', 'wireless'],
};

const recommendations = scoreRecommendations(user, products, simGraph);
console.log(recommendations.slice(0, 5).map(r => ({
  product: index.getById(r.productId)?.name,
  score: r.totalScore.toFixed(1),
})));
```

---

## 6. PARTIE D — Cache et pagination

```typescript
// Module 11 : LRU Cache avec TTL + pagination curseur

// Cache des recommandations
class RecommendationCache {
  private cache: Map<string, { data: RecommendationScore[]; expiresAt: number }> = new Map();
  private maxSize: number;
  private ttl: number;

  constructor(maxSize = 1000, ttlMs = 300_000) { // 5 min TTL
    this.maxSize = maxSize;
    this.ttl = ttlMs;
  }

  get(userId: string): RecommendationScore[] | null {
    const entry = this.cache.get(userId);
    if (!entry || Date.now() > entry.expiresAt) {
      this.cache.delete(userId);
      return null;
    }

    // Move to end (LRU)
    this.cache.delete(userId);
    this.cache.set(userId, entry);
    return entry.data;
  }

  set(userId: string, data: RecommendationScore[]): void {
    this.cache.delete(userId);

    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    this.cache.set(userId, {
      data,
      expiresAt: Date.now() + this.ttl,
    });
  }
}

// Pagination curseur des recommandations
interface RecommendationPage {
  items: Array<{ product: Product; score: number }>;
  nextCursor: string | null;
  total: number;
}

function paginateRecommendations(
  scores: RecommendationScore[],
  index: ProductIndex,
  cursor: string | null,
  limit: number,
): RecommendationPage {
  let startIdx = 0;

  if (cursor) {
    const lastId = Buffer.from(cursor, 'base64').toString('utf8');
    startIdx = scores.findIndex(s => s.productId === lastId) + 1;
  }

  const page = scores.slice(startIdx, startIdx + limit);
  const hasMore = startIdx + limit < scores.length;

  return {
    items: page.map(s => ({
      product: index.getById(s.productId)!,
      score: s.totalScore,
    })),
    nextCursor: hasMore
      ? Buffer.from(page[page.length - 1].productId).toString('base64')
      : null,
    total: scores.length,
  };
}
```

---

## 7. PARTIE E — API complète

```typescript
// Assembler toutes les parties

class RecommendationEngine {
  private index: ProductIndex;
  private graph: SimilarityGraph;
  private cache: RecommendationCache;

  constructor(products: Product[]) {
    this.index = new ProductIndex(products);
    this.graph = buildSimilarityGraph(products);
    this.cache = new RecommendationCache();
  }

  // Point d'entrée principal
  recommend(
    user: User,
    options: { cursor?: string; limit?: number } = {},
  ): RecommendationPage {
    const { cursor = null, limit = 10 } = options;

    // Vérifier le cache
    let scores = this.cache.get(user.id);

    if (!scores) {
      // Calculer les recommandations
      scores = scoreRecommendations(
        user,
        [...this.index['byId'].values()],
        this.graph,
      );
      this.cache.set(user.id, scores);
    }

    return paginateRecommendations(scores, this.index, cursor, limit);
  }

  // Recherche avec autocomplétion
  search(query: string): string[] {
    return this.index.autocomplete(query);
  }

  // Produits similaires
  similar(productId: string, limit = 5): Product[] {
    return topSimilar(this.graph, productId, limit)
      .map(s => this.index.getById(s.id)!)
      .filter(Boolean);
  }
}

// === UTILISATION FINALE ===

const engine = new RecommendationEngine(products);

// 1. Recherche
console.log('Search "mac":', engine.search('mac'));

// 2. Recommandations paginées
const page1 = engine.recommend(user, { limit: 3 });
console.log('Page 1:', page1.items.map(i => `${i.product.name} (${i.score.toFixed(1)})`));

if (page1.nextCursor) {
  const page2 = engine.recommend(user, { cursor: page1.nextCursor, limit: 3 });
  console.log('Page 2:', page2.items.map(i => `${i.product.name} (${i.score.toFixed(1)})`));
}

// 3. Produits similaires
console.log('Similar to MacBook:', engine.similar('p1').map(p => p.name));
```

---

## 8. Algorithmes utilisés — récapitulatif

```
┌──────────────────────────────────────────────────────────────┐
│  Composant              │  Algorithme / Structure  │ Module  │
├─────────────────────────┼──────────────────────────┼─────────┤
│  Index de recherche     │  Trie + HashMap          │ 02, 10  │
│  Autocomplétion         │  Trie.autocomplete       │ 10      │
│  Graphe de similarité   │  Graphe pondéré          │ 07      │
│  Top-N similaires       │  Tri / Heap              │ 05      │
│  Scoring multi-critères │  HashMap + tri           │ 02, 05  │
│  Cache LRU+TTL          │  Map ordonnée + eviction │ 03, 11  │
│  Pagination curseur     │  Binary search / offset  │ 04, 11  │
│  Exclusion déjà achetés │  Set                     │ 02      │
│  Normalisation scores   │  Math (min/max scaling)  │ 01      │
│  Complexité globale     │  O(n²) build, O(n log n) │ 01      │
│                         │  query avec cache O(1)   │         │
└─────────────────────────┴──────────────────────────┴─────────┘
```

---

## 9. Extensions possibles

1. **Collaborative filtering** : "les utilisateurs qui ont acheté X ont aussi acheté Y" — utilise BFS sur un graphe bipartite user↔produit.
2. **TF-IDF** sur les descriptions de produits pour la recherche sémantique.
3. **A/B testing** : comparer différentes pondérations du score.
4. **Real-time updates** : recalculer le graphe de similarité quand un produit est ajouté.
5. **Bloom filter** : vérifier rapidement si un produit a déjà été vu (économise des lookups DB).
6. **Batch processing** : recalculer les recommandations en arrière-plan avec des workers.

---

## Points clés

1. Un moteur de recommandation combine **graphes**, **hashing**, **tri**, **cache** et **pagination**.
2. L'indexation préalable (Trie, HashMap) rend les recherches instantanées.
3. Le graphe de similarité transforme les relations entre produits en données exploitables.
4. Le scoring multi-critères permet d'ajuster les recommandations aux besoins business.
5. Le cache LRU+TTL évite de recalculer les recommandations à chaque requête.
6. La pagination curseur garantit des performances constantes.
7. Chaque composant est **testable indépendamment**.
8. En production, ce type de système gère des millions de produits — la complexité algorithmique devient cruciale.

---

## Pour aller plus loin

- [System Design Primer — Recommendation System](https://github.com/donnemartin/system-design-primer) — design à grande échelle
- [Stanford CS246 — Mining Massive Datasets](http://www.mmds.org/) — recommandation algorithmique
- [Redis — Sorted Sets](https://redis.io/docs/data-types/sorted-sets/) — implémentation production du top-N

---

## Si tu es perdu

1. Le projet combine les techniques de tous les modules — relis ceux que tu ne maîtrises pas.
2. Chaque partie (A-E) est indépendante — implémente-les une par une.
3. Commence par les données et l'index (Partie A), c'est le plus simple.
4. Les recommandations (Partie C) sont juste du scoring + tri.
5. Le cache (Partie D) est du bonus — le système fonctionne sans.

---

## Défi

> Ajoute le **collaborative filtering** : créer un graphe bipartite user↔produit, puis pour un utilisateur donné, trouver les utilisateurs similaires (même achats) et recommander les produits que ces utilisateurs ont achetés mais pas l'utilisateur courant.

<details>
<summary>Réponse</summary>

```typescript
function collaborativeFilter(
  users: User[],
  currentUser: User,
  limit: number,
): string[] {
  const myPurchases = new Set(currentUser.purchasedProducts);

  // Calculer la similarité avec chaque autre utilisateur
  // (coefficient de Jaccard sur les achats)
  const similarities: Array<{ userId: string; score: number; products: string[] }> = [];

  for (const other of users) {
    if (other.id === currentUser.id) continue;

    const otherPurchases = new Set(other.purchasedProducts);
    const intersection = [...myPurchases].filter(p => otherPurchases.has(p)).length;
    const union = new Set([...myPurchases, ...otherPurchases]).size;

    if (intersection === 0) continue;

    const jaccard = intersection / union;

    // Produits que l'autre a achetés mais pas moi
    const newProducts = other.purchasedProducts.filter(p => !myPurchases.has(p));

    if (newProducts.length > 0) {
      similarities.push({
        userId: other.id,
        score: jaccard,
        products: newProducts,
      });
    }
  }

  // Trier par similarité décroissante
  similarities.sort((a, b) => b.score - a.score);

  // Collecter les recommandations uniques
  const recommended = new Set<string>();
  for (const sim of similarities) {
    for (const productId of sim.products) {
      recommended.add(productId);
      if (recommended.size >= limit) break;
    }
    if (recommended.size >= limit) break;
  }

  return [...recommended];
}
```

</details>

---

::: tip Parcours recommandé
🎉 Tu as terminé le cours ! Revois les modules où tu as eu le plus de difficulté, et essaie de résoudre les défis sans regarder les solutions.
:::
