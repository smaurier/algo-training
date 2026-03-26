// =============================================================================
// Lab 01 — Analyse de complexité
// =============================================================================
// Exécuter avec : npx tsx exercise.ts
// =============================================================================

console.log("=== Lab 01 : Analyse de complexité ===\n");

// =============================================================================
// PARTIE 1 : Prédire et mesurer la complexité
// =============================================================================
// Chaque fonction ci-dessous détecte si un tableau contient un doublon.
// AVANT de lancer le script, prédisez la complexité Big-O de chacune.
// =============================================================================

// TODO : Prédisez la complexité de chaque fonction
const predictions = {
  hasDuplicateA: "O(?)",  // Remplacez ? par votre prédiction
  hasDuplicateB: "O(?)",
  hasDuplicateC: "O(?)",
  hasDuplicateD: "O(?)",
};

// Approche A — Double boucle
function hasDuplicateA(arr: number[]): boolean {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) return true;
    }
  }
  return false;
}

// Approche B — Tri puis comparaison adjacente
function hasDuplicateB(arr: number[]): boolean {
  const sorted = [...arr].sort((a, b) => a - b);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1]) return true;
  }
  return false;
}

// Approche C — Avec Set
function hasDuplicateC(arr: number[]): boolean {
  const seen = new Set<number>();
  for (const num of arr) {
    if (seen.has(num)) return true;
    seen.add(num);
  }
  return false;
}

// Approche D — Avec Array.includes
function hasDuplicateD(arr: number[]): boolean {
  const seen: number[] = [];
  for (const num of arr) {
    if (seen.includes(num)) return true;
    seen.push(num);
  }
  return false;
}

// Fonction utilitaire de benchmark
function benchmark(fn: () => void, iterations = 3): number {
  const times: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    times.push(performance.now() - start);
  }
  times.sort((a, b) => a - b);
  return times[Math.floor(times.length / 2)]; // médiane
}

// TODO : Complétez le benchmark pour les 4 tailles de tableau
const sizes = [100, 1_000, 10_000, 50_000];

console.log("--- Partie 1 : Benchmark des 4 approches ---");
console.log("Taille\t\tA (double)\tB (tri)\t\tC (Set)\t\tD (includes)");

for (const n of sizes) {
  // Générer un tableau SANS doublon (pire cas)
  const arr = Array.from({ length: n }, (_, i) => i);

  // TODO : Mesurez le temps de chaque approche et affichez les résultats
  // Utilisez la fonction benchmark() ci-dessus
  // Format : console.log(`${n}\t\t${timeA.toFixed(2)}ms\t\t${timeB.toFixed(2)}ms\t\t...`)

}

console.log("\nVos prédictions :", predictions);
console.log("TODO : Vérifiez si vos prédictions correspondent aux mesures !\n");

// =============================================================================
// PARTIE 2 : Piège des méthodes natives
// =============================================================================
// Mesurez le coût réel de la recherche dans différentes structures.
// =============================================================================

console.log("--- Partie 2 : Recherche dans les structures natives ---");

function benchmarkNativeMethods(): void {
  // TODO : Implémentez cette fonction
  //
  // Pour chaque taille n dans [1_000, 10_000, 100_000, 1_000_000] :
  // 1. Créez un Array, un Set et une Map contenant les nombres de 0 à n-1
  // 2. Mesurez le temps de 1000 recherches de valeurs ALÉATOIRES dans chaque structure
  // 3. Affichez les résultats dans un tableau formaté
  //
  // Attention : testez la recherche d'éléments qui EXISTENT et qui N'EXISTENT PAS
  //
  // Structures à tester :
  //   - Array.includes(value)
  //   - Set.has(value)
  //   - Map.has(value)
  //
  // Quel pattern de complexité observez-vous pour chaque structure ?

  console.log("benchmarkNativeMethods() n'est pas encore implémentée.");
}

benchmarkNativeMethods();

// =============================================================================
// PARTIE 3 : Trouver le point de croisement
// =============================================================================
// À quelle taille n un algorithme O(n log n) devient-il plus rapide que O(n²) ?
// =============================================================================

console.log("\n--- Partie 3 : Point de croisement ---");

function findCrossoverPoint(): number {
  // TODO : Implémentez cette fonction
  //
  // Comparez hasDuplicateA (O(n²)) et hasDuplicateB (O(n log n))
  // pour des tailles croissantes : 10, 20, 50, 100, 200, 500, 1000, 2000, 5000
  //
  // Pour chaque taille, faites 5 mesures et prenez la médiane.
  // Retournez la taille n à partir de laquelle B est systématiquement plus rapide que A.
  //
  // Astuce : le tri a un overhead constant plus élevé (allocation d'un nouveau tableau),
  // donc B peut être plus lent que A pour les très petits tableaux.

  return 0; // À modifier
}

const crossover = findCrossoverPoint();
if (crossover === 0) {
  console.log("findCrossoverPoint() n'est pas encore implémentée.");
} else {
  console.log(`Point de croisement : n ≈ ${crossover}`);
  console.log("En dessous, O(n²) est plus rapide grâce aux constantes plus faibles.");
  console.log("Au dessus, O(n log n) domine.\n");
}

// =============================================================================
// PARTIE BONUS : Mesure de la consommation mémoire
// =============================================================================

console.log("--- Bonus : Consommation mémoire ---");

function benchmarkMemory(): void {
  // TODO : Implémentez cette fonction
  //
  // Pour n = 100_000 éléments :
  // 1. Mesurez la mémoire avant et après la création de :
  //    - un Array<number>
  //    - un Set<number>
  //    - une Map<number, boolean>
  //    - un objet { [key: number]: boolean }
  // 2. Utilisez process.memoryUsage().heapUsed
  // 3. Forcez le GC entre chaque mesure avec global.gc() (lancer avec --expose-gc)
  //    Ou faites les mesures séparément
  // 4. Affichez les résultats en MB
  //
  // Quelle structure consomme le plus de mémoire ? Pourquoi ?

  console.log("benchmarkMemory() n'est pas encore implémentée.");
}

benchmarkMemory();

console.log("\n=== Fin du Lab 01 ===");
