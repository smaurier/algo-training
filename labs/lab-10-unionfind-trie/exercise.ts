// =============================================================================
// Lab 10 — UnionFind et Trie
// =============================================================================
// Exécuter avec : npx tsx exercise.ts
// =============================================================================

console.log("=== Lab 10 : UnionFind et Trie ===\n");

// =============================================================================
// PARTIE 1 : UnionFind
// =============================================================================

console.log("--- Partie 1 : UnionFind ---");

class UnionFind {
  private parent: number[];
  private rank: number[];
  private count: number;

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
    this.count = n;
  }

  find(x: number): number {
    // TODO : Trouver la racine de x avec path compression
    // Remonter jusqu'à la racine, puis écraser parent[x] = racine
    return x;
  }

  union(x: number, y: number): boolean {
    // TODO : Unir les ensembles de x et y par rang
    // Retourner false si déjà dans le même ensemble
    // Décrémenter this.count si union effectuée
    return false;
  }

  connected(x: number, y: number): boolean {
    return this.find(x) === this.find(y);
  }

  get components(): number {
    return this.count;
  }
}

// Test
const uf = new UnionFind(10);
uf.union(0, 1); uf.union(2, 3); uf.union(4, 5);
uf.union(0, 2); uf.union(6, 7);
console.log("connected(0,3):", uf.connected(0, 3)); // true
console.log("connected(0,4):", uf.connected(0, 4)); // false
console.log("components:", uf.components);            // 5 (après 5 unions)

// =============================================================================
// PARTIE 2 : Composantes connexes
// =============================================================================

console.log("\n--- Partie 2 : Composantes connexes ---");

function findConnectedComponents(n: number, edges: [number, number][]): number[][] {
  // TODO : Retourner les groupes de nœuds connectés
  // 1. Créer un UnionFind de taille n
  // 2. Unir selon les edges
  // 3. Regrouper les nœuds par racine (find)

  return [];
}

const edges: [number, number][] = [[0, 1], [1, 2], [3, 4], [5, 6], [6, 7], [7, 8]];
console.log("Composantes:", findConnectedComponents(9, edges));
// Attendu : [[0,1,2], [3,4], [5,6,7,8]]

// =============================================================================
// PARTIE 3 : Trie avec autocomplétion
// =============================================================================

console.log("\n--- Partie 3 : Trie ---");

class TrieNode {
  children = new Map<string, TrieNode>();
  isEnd = false;
}

class Trie {
  private root = new TrieNode();

  insert(word: string): void {
    // TODO : Insérer un mot dans le Trie
    // Parcourir chaque caractère, créer les nœuds manquants
    // Marquer le dernier nœud comme isEnd = true
  }

  search(word: string): boolean {
    // TODO : Retourner true si le mot exact existe
    return false;
  }

  startsWith(prefix: string): boolean {
    // TODO : Retourner true si un mot commençant par prefix existe
    return false;
  }

  autocomplete(prefix: string, limit: number = 5): string[] {
    // TODO : Retourner les mots commençant par prefix (max limit résultats)
    // 1. Naviguer jusqu'au nœud du préfixe
    // 2. DFS depuis ce nœud pour collecter les mots complets
    return [];
  }
}

const trie = new Trie();
["apple", "app", "application", "apply", "apt", "banana", "band", "ban"].forEach(w => trie.insert(w));

console.log("search('app'):", trie.search("app"));       // true
console.log("search('appl'):", trie.search("appl"));     // false
console.log("startsWith('app'):", trie.startsWith("app")); // true
console.log("autocomplete('app'):", trie.autocomplete("app"));
// Attendu : ["app", "apple", "application", "apply"]

// =============================================================================
// PARTIE BONUS : Routeur avec Trie
// =============================================================================

console.log("\n--- Bonus : API Router ---");

class TrieRouter {
  // TODO : Un routeur qui utilise un Trie pour matcher les routes
  // Supportez les segments dynamiques comme :id
  // Exemple : "/users/:id/posts" matche "/users/42/posts"

  addRoute(method: string, path: string, handler: string): void {
    // TODO
  }

  match(method: string, path: string): { handler: string; params: Record<string, string> } | null {
    // TODO
    return null;
  }
}

const router = new TrieRouter();
router.addRoute("GET", "/users", "listUsers");
router.addRoute("GET", "/users/:id", "getUser");
router.addRoute("GET", "/users/:id/posts", "getUserPosts");
router.addRoute("POST", "/users", "createUser");

console.log(router.match("GET", "/users"));
console.log(router.match("GET", "/users/42"));
console.log(router.match("GET", "/users/42/posts"));

console.log("\n=== Fin du Lab 10 ===");
