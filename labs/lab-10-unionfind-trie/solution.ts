// =============================================================================
// Lab 10 — UnionFind et Trie — Solutions
// =============================================================================
// Exécuter avec : npx tsx solution.ts
// =============================================================================

console.log("=== Lab 10 : UnionFind et Trie — Solutions ===\n");

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
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // path compression
    }
    return this.parent[x];
  }

  union(x: number, y: number): boolean {
    const rx = this.find(x), ry = this.find(y);
    if (rx === ry) return false;

    if (this.rank[rx] < this.rank[ry]) {
      this.parent[rx] = ry;
    } else if (this.rank[rx] > this.rank[ry]) {
      this.parent[ry] = rx;
    } else {
      this.parent[ry] = rx;
      this.rank[rx]++;
    }
    this.count--;
    return true;
  }

  connected(x: number, y: number): boolean {
    return this.find(x) === this.find(y);
  }

  get components(): number {
    return this.count;
  }
}

const uf = new UnionFind(10);
uf.union(0, 1); uf.union(2, 3); uf.union(4, 5);
uf.union(0, 2); uf.union(6, 7);
console.log("connected(0,3):", uf.connected(0, 3));
console.log("connected(0,4):", uf.connected(0, 4));
console.log("components:", uf.components);

// =============================================================================
// PARTIE 2 : Composantes connexes
// =============================================================================

console.log("\n--- Partie 2 : Composantes connexes ---");

function findConnectedComponents(n: number, edges: [number, number][]): number[][] {
  const uf2 = new UnionFind(n);
  for (const [a, b] of edges) uf2.union(a, b);

  const groups = new Map<number, number[]>();
  for (let i = 0; i < n; i++) {
    const root = uf2.find(i);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root)!.push(i);
  }

  return [...groups.values()];
}

const edges: [number, number][] = [[0, 1], [1, 2], [3, 4], [5, 6], [6, 7], [7, 8]];
console.log("Composantes:", findConnectedComponents(9, edges));

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
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
      node = node.children.get(ch)!;
    }
    node.isEnd = true;
  }

  search(word: string): boolean {
    const node = this._navigate(word);
    return node !== null && node.isEnd;
  }

  startsWith(prefix: string): boolean {
    return this._navigate(prefix) !== null;
  }

  autocomplete(prefix: string, limit: number = 5): string[] {
    const node = this._navigate(prefix);
    if (!node) return [];

    const results: string[] = [];
    const dfs = (n: TrieNode, path: string) => {
      if (results.length >= limit) return;
      if (n.isEnd) results.push(path);
      for (const [ch, child] of n.children) {
        if (results.length >= limit) return;
        dfs(child, path + ch);
      }
    };
    dfs(node, prefix);
    return results;
  }

  private _navigate(prefix: string): TrieNode | null {
    let node = this.root;
    for (const ch of prefix) {
      if (!node.children.has(ch)) return null;
      node = node.children.get(ch)!;
    }
    return node;
  }
}

const trie = new Trie();
["apple", "app", "application", "apply", "apt", "banana", "band", "ban"].forEach(w => trie.insert(w));

console.log("search('app'):", trie.search("app"));
console.log("search('appl'):", trie.search("appl"));
console.log("startsWith('app'):", trie.startsWith("app"));
console.log("autocomplete('app'):", trie.autocomplete("app"));

// =============================================================================
// PARTIE BONUS : API Router
// =============================================================================

console.log("\n--- Bonus : API Router ---");

class RouteNode {
  children = new Map<string, RouteNode>();
  paramName: string | null = null;
  paramChild: RouteNode | null = null;
  handlers = new Map<string, string>();
}

class TrieRouter {
  private root = new RouteNode();

  addRoute(method: string, path: string, handler: string): void {
    const segments = path.split("/").filter(Boolean);
    let node = this.root;

    for (const seg of segments) {
      if (seg.startsWith(":")) {
        if (!node.paramChild) {
          node.paramChild = new RouteNode();
          node.paramChild.paramName = seg.slice(1);
        }
        node = node.paramChild;
      } else {
        if (!node.children.has(seg)) node.children.set(seg, new RouteNode());
        node = node.children.get(seg)!;
      }
    }
    node.handlers.set(method, handler);
  }

  match(method: string, path: string): { handler: string; params: Record<string, string> } | null {
    const segments = path.split("/").filter(Boolean);
    const params: Record<string, string> = {};
    let node = this.root;

    for (const seg of segments) {
      if (node.children.has(seg)) {
        node = node.children.get(seg)!;
      } else if (node.paramChild) {
        params[node.paramChild.paramName!] = seg;
        node = node.paramChild;
      } else {
        return null;
      }
    }

    const handler = node.handlers.get(method);
    return handler ? { handler, params } : null;
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
