// =============================================================================
// Lab 07 — Graphes et dépendances — Solutions
// =============================================================================
// Exécuter avec : npx tsx solution.ts
// =============================================================================

console.log("=== Lab 07 : Graphes et dépendances — Solutions ===\n");

// =============================================================================
// PARTIE 1 : Construire un graphe de dépendances
// =============================================================================

console.log("--- Partie 1 : Graphe de dépendances ---");

type Graph = Map<string, string[]>;
type Deps = [string, string][];

function buildGraph(deps: Deps): { graph: Graph; inDegree: Map<string, number> } {
  const graph: Graph = new Map();
  const inDegree = new Map<string, number>();

  // Collecter tous les nœuds
  for (const [task, dep] of deps) {
    if (!graph.has(task)) { graph.set(task, []); inDegree.set(task, 0); }
    if (!graph.has(dep)) { graph.set(dep, []); inDegree.set(dep, 0); }
  }

  // Construire arêtes dep → task
  for (const [task, dep] of deps) {
    graph.get(dep)!.push(task);
    inDegree.set(task, inDegree.get(task)! + 1);
  }

  return { graph, inDegree };
}

const deps: Deps = [
  ["ui", "core"],
  ["api", "core"],
  ["api", "utils"],
  ["auth", "api"],
  ["app", "ui"],
  ["app", "auth"],
];

const { graph, inDegree } = buildGraph(deps);
console.log("Graphe:", Object.fromEntries(graph));
console.log("Degrés:", Object.fromEntries(inDegree));

// =============================================================================
// PARTIE 2 : Tri topologique (Kahn)
// =============================================================================

console.log("\n--- Partie 2 : Tri topologique ---");

function topoSort(graph: Graph, inDegree: Map<string, number>): string[] | null {
  const deg = new Map(inDegree); // copie
  const queue: string[] = [];

  for (const [node, d] of deg) {
    if (d === 0) queue.push(node);
  }

  const result: string[] = [];

  while (queue.length > 0) {
    const node = queue.shift()!;
    result.push(node);

    for (const neighbor of graph.get(node) || []) {
      const newDeg = deg.get(neighbor)! - 1;
      deg.set(neighbor, newDeg);
      if (newDeg === 0) queue.push(neighbor);
    }
  }

  return result.length === graph.size ? result : null;
}

const buildOrder = topoSort(graph, inDegree);
console.log("Ordre de build:", buildOrder);

// =============================================================================
// PARTIE 3 : Détection de cycles (DFS 3 couleurs)
// =============================================================================

console.log("\n--- Partie 3 : Détection de cycles ---");

function hasCycle(graph: Graph): boolean {
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map<string, number>();

  for (const node of graph.keys()) color.set(node, WHITE);

  function dfs(node: string): boolean {
    color.set(node, GRAY);
    for (const neighbor of graph.get(node) || []) {
      if (color.get(neighbor) === GRAY) return true;  // cycle !
      if (color.get(neighbor) === WHITE && dfs(neighbor)) return true;
    }
    color.set(node, BLACK);
    return false;
  }

  for (const node of graph.keys()) {
    if (color.get(node) === WHITE && dfs(node)) return true;
  }

  return false;
}

console.log("Graphe a un cycle:", hasCycle(graph));

const cyclicGraph: Graph = new Map([
  ["A", ["B"]],
  ["B", ["C"]],
  ["C", ["A"]],
]);
console.log("Graphe cyclique:", hasCycle(cyclicGraph));

// =============================================================================
// PARTIE BONUS : Plus court chemin (BFS)
// =============================================================================

console.log("\n--- Bonus : Plus court chemin ---");

function shortestPath(graph: Graph, start: string, end: string): string[] | null {
  if (start === end) return [start];

  const visited = new Set<string>([start]);
  const parent = new Map<string, string>();
  const queue: string[] = [start];

  while (queue.length > 0) {
    const node = queue.shift()!;

    for (const neighbor of graph.get(node) || []) {
      if (visited.has(neighbor)) continue;
      visited.add(neighbor);
      parent.set(neighbor, node);

      if (neighbor === end) {
        // Reconstruire le chemin
        const path: string[] = [end];
        let current = end;
        while (current !== start) {
          current = parent.get(current)!;
          path.unshift(current);
        }
        return path;
      }

      queue.push(neighbor);
    }
  }

  return null;
}

const networkGraph: Graph = new Map([
  ["Paris", ["Lyon", "Lille"]],
  ["Lyon", ["Paris", "Marseille", "Grenoble"]],
  ["Lille", ["Paris", "Bruxelles"]],
  ["Marseille", ["Lyon", "Nice"]],
  ["Grenoble", ["Lyon"]],
  ["Bruxelles", ["Lille", "Amsterdam"]],
  ["Amsterdam", ["Bruxelles"]],
  ["Nice", ["Marseille"]],
]);

console.log("Paris → Nice:", shortestPath(networkGraph, "Paris", "Nice"));
console.log("Lille → Grenoble:", shortestPath(networkGraph, "Lille", "Grenoble"));

console.log("\n=== Fin du Lab 07 ===");
