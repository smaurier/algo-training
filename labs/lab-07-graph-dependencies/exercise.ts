// =============================================================================
// Lab 07 — Graphes et dépendances
// =============================================================================
// Exécuter avec : npx tsx exercise.ts
// =============================================================================

console.log("=== Lab 07 : Graphes et dépendances ===\n");

// =============================================================================
// PARTIE 1 : Construire un graphe de dépendances
// =============================================================================

console.log("--- Partie 1 : Graphe de dépendances ---");

type Graph = Map<string, string[]>;
type Deps = [string, string][]; // [tâche, dépendance]

function buildGraph(deps: Deps): { graph: Graph; inDegree: Map<string, number> } {
  // TODO : Construire un graphe orienté et calculer les degrés entrants
  // deps = [["B", "A"]] signifie B dépend de A → arête A → B
  // 1. Collecter tous les nœuds (source et cible)
  // 2. Créer la liste d'adjacence
  // 3. Compter le degré entrant de chaque nœud

  const graph: Graph = new Map();
  const inDegree = new Map<string, number>();

  // TODO : votre code ici

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
  // TODO : Algorithme de Kahn
  // 1. Collectez tous les nœuds de degré 0 dans une queue
  // 2. Pour chaque nœud de la queue :
  //    - Ajoutez-le au résultat
  //    - Décrémentez le degré de ses voisins
  //    - Si un voisin atteint 0, ajoutez-le à la queue
  // 3. Si result.length !== nombre de nœuds → cycle → retourner null

  return null;
}

const buildOrder = topoSort(graph, inDegree);
console.log("Ordre de build:", buildOrder);
// Possible: ["core", "utils", "ui", "api", "auth", "app"]

// =============================================================================
// PARTIE 3 : Détection de cycles (DFS 3 couleurs)
// =============================================================================

console.log("\n--- Partie 3 : Détection de cycles ---");

function hasCycle(graph: Graph): boolean {
  // TODO : DFS avec marquage WHITE (non visité), GRAY (en cours), BLACK (terminé)
  // Si on rencontre un nœud GRAY → cycle trouvé
  // Lancer DFS depuis chaque nœud WHITE

  return false;
}

console.log("Graphe a un cycle:", hasCycle(graph)); // false

// Test avec cycle
const cyclicGraph: Graph = new Map([
  ["A", ["B"]],
  ["B", ["C"]],
  ["C", ["A"]], // cycle !
]);
console.log("Graphe cyclique:", hasCycle(cyclicGraph)); // true

// =============================================================================
// PARTIE BONUS : Plus court chemin (BFS)
// =============================================================================

console.log("\n--- Bonus : Plus court chemin ---");

function shortestPath(graph: Graph, start: string, end: string): string[] | null {
  // TODO : BFS qui retourne le chemin le plus court
  // Utilisez une Map<string, string> pour stocker le parent de chaque nœud visité
  // Reconstruire le chemin en remontant les parents depuis end jusqu'à start

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
// Attendu : ["Paris", "Lyon", "Marseille", "Nice"]
console.log("Lille → Grenoble:", shortestPath(networkGraph, "Lille", "Grenoble"));
// Attendu : ["Lille", "Paris", "Lyon", "Grenoble"]

console.log("\n=== Fin du Lab 07 ===");
