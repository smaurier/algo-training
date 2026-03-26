// =============================================================================
// Lab 12 — Moteur de recommandation (Projet final)
// =============================================================================
// Exécuter avec : npx tsx exercise.ts
// =============================================================================

console.log("=== Lab 12 : Moteur de recommandation ===\n");

// =============================================================================
// Données de test
// =============================================================================

interface Product {
  id: string;
  name: string;
  tags: string[];
  price: number;
  popularity: number; // 0—100
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
// PARTIE 1 : ProductIndex avec Trie
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
    // TODO : Indexer le produit
    // 1. Stocker dans byId
    // 2. Insérer le nom (en minuscules) dans le Trie
    // 3. Indexer chaque tag dans byTag
  }

  searchByPrefix(prefix: string): Product[] {
    // TODO : Utiliser le Trie pour trouver les produits dont le nom matche le prefix
    return [];
  }

  searchByTag(tag: string): Product[] {
    // TODO : Retourner les produits ayant ce tag
    return [];
  }
}

const index = new ProductIndex();
catalog.forEach(p => index.addProduct(p));

console.log("Prefix 'mac':", index.searchByPrefix("mac").map(p => p.name));
// Attendu : ["MacBook Pro", "MacBook Air", "Magic Mouse"]
console.log("Tag 'apple':", index.searchByTag("apple").map(p => p.name));

// =============================================================================
// PARTIE 2 : Graphe de similarité
// =============================================================================

console.log("\n--- Partie 2 : Graphe de similarité ---");

function jaccardSimilarity(tags1: string[], tags2: string[]): number {
  // TODO : Calculer la similarité de Jaccard
  // intersection.size / union.size
  return 0;
}

function buildSimilarityGraph(products: Product[], threshold: number = 0.2): Map<string, Map<string, number>> {
  // TODO : Construire un graphe pondéré
  // Pour chaque paire de produits, calculer Jaccard
  // Si similarity >= threshold, ajouter une arête pondérée

  return new Map();
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
// PARTIE 3 : Moteur de recommandation
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
  // TODO : Ajouter un LRU cache

  constructor(products: Product[]) {
    this.index = new ProductIndex();
    products.forEach(p => this.index.addProduct(p));
    this.graph = buildSimilarityGraph(products);
  }

  recommend(productId: string, k: number = 5): Recommendation[] {
    // TODO : Retourner les K meilleures recommandations pour un produit
    // Score = 0.5 * similarity + 0.3 * (popularity/100) + 0.2 * priceSimilarity
    // priceSimilarity = 1 - |price1 - price2| / max(price1, price2)
    //
    // Utilisez un MinHeap de taille K pour extraire efficacement les Top-K
    // Vérifier le cache d'abord, stocker le résultat dans le cache après calcul

    return [];
  }
}

const engine = new RecommendationEngine(catalog);
const recs = engine.recommend("p1", 3);
console.log("\nRecommandations pour MacBook Pro:");
recs.forEach((r, i) => {
  console.log(`  ${i + 1}. ${r.product.name} (score: ${r.score.toFixed(2)})`);
});

// =============================================================================
// PARTIE BONUS : Cursor Pagination
// =============================================================================

console.log("\n--- Bonus : Pagination ---");

// TODO : Ajoutez une méthode recommendPaginated(productId, cursor, limit) au moteur
// qui retourne des résultats paginés avec un curseur

console.log("\n=== Fin du Lab 12 ===");
