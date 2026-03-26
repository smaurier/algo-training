// =============================================================================
// Lab 01 — Analyse de complexité — SOLUTION
// =============================================================================
// Exécuter avec : npx tsx solution.ts
// =============================================================================

console.log("=== Lab 01 : Analyse de complexité — SOLUTION ===\n");

// =============================================================================
// PARTIE 1 : Prédire et mesurer la complexité
// =============================================================================

const predictions = {
  hasDuplicateA: "O(n²)",       // Double boucle → quadratique
  hasDuplicateB: "O(n log n)",  // Tri TimSort + scan linéaire
  hasDuplicateC: "O(n)",        // Set.has est O(1) amorti → n appels = O(n)
  hasDuplicateD: "O(n²)",       // Array.includes est O(n) → n appels = O(n²)
};

function hasDuplicateA(arr: number[]): boolean {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) return true;
    }
  }
  return false;
}

function hasDuplicateB(arr: number[]): boolean {
  const sorted = [...arr].sort((a, b) => a - b);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1]) return true;
  }
  return false;
}

function hasDuplicateC(arr: number[]): boolean {
  const seen = new Set<number>();
  for (const num of arr) {
    if (seen.has(num)) return true;
    seen.add(num);
  }
  return false;
}

function hasDuplicateD(arr: number[]): boolean {
  const seen: number[] = [];
  for (const num of arr) {
    if (seen.includes(num)) return true;
    seen.push(num);
  }
  return false;
}

function benchmark(fn: () => void, iterations = 5): number {
  const times: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    times.push(performance.now() - start);
  }
  times.sort((a, b) => a - b);
  return times[Math.floor(times.length / 2)];
}

const sizes = [100, 1_000, 10_000, 50_000];

console.log("--- Partie 1 : Benchmark des 4 approches ---");
console.log("Taille\t\tA (n²)\t\tB (n log n)\tC (Set/n)\tD (includes/n²)");

for (const n of sizes) {
  const arr = Array.from({ length: n }, (_, i) => i);

  const timeA = n <= 10_000 ? benchmark(() => hasDuplicateA(arr)) : -1;
  const timeB = benchmark(() => hasDuplicateB(arr));
  const timeC = benchmark(() => hasDuplicateC(arr));
  const timeD = n <= 10_000 ? benchmark(() => hasDuplicateD(arr)) : -1;

  const fmt = (t: number) => t < 0 ? "skip" : `${t.toFixed(2)}ms`;
  console.log(`${n}\t\t${fmt(timeA)}\t\t${fmt(timeB)}\t\t${fmt(timeC)}\t\t${fmt(timeD)}`);
}

console.log("\nPrédictions :", predictions);
console.log("✅ Les mesures devraient confirmer les prédictions.\n");

// =============================================================================
// PARTIE 2 : Piège des méthodes natives
// =============================================================================

console.log("--- Partie 2 : Recherche dans les structures natives ---");

function benchmarkNativeMethods(): void {
  const testSizes = [1_000, 10_000, 100_000, 1_000_000];

  console.log("n\t\tArray.includes\tSet.has\t\tMap.has");

  for (const n of testSizes) {
    // Créer les structures
    const arr = Array.from({ length: n }, (_, i) => i);
    const set = new Set(arr);
    const map = new Map(arr.map(v => [v, true]));

    const numSearches = 1000;
    // Rechercher des valeurs qui EXISTENT (moitié) et qui N'EXISTENT PAS (moitié)
    const searchValues = Array.from({ length: numSearches }, (_, i) =>
      i % 2 === 0 ? Math.floor(Math.random() * n) : n + i,
    );

    const timeArr = benchmark(() => {
      for (const v of searchValues) arr.includes(v);
    });

    const timeSet = benchmark(() => {
      for (const v of searchValues) set.has(v);
    });

    const timeMap = benchmark(() => {
      for (const v of searchValues) map.has(v);
    });

    console.log(
      `${n}\t\t${timeArr.toFixed(2)}ms\t\t${timeSet.toFixed(2)}ms\t\t${timeMap.toFixed(2)}ms`,
    );
  }

  console.log("\n📊 Observation :");
  console.log("  - Array.includes : temps augmente linéairement avec n → O(n)");
  console.log("  - Set.has : temps quasi constant → O(1) amorti");
  console.log("  - Map.has : temps quasi constant → O(1) amorti");
  console.log("  → Pour la recherche, TOUJOURS utiliser Set ou Map !\n");
}

benchmarkNativeMethods();

// =============================================================================
// PARTIE 3 : Trouver le point de croisement
// =============================================================================

console.log("--- Partie 3 : Point de croisement ---");

function findCrossoverPoint(): number {
  const testSizes = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000];

  console.log("n\tA (n²)\t\tB (n log n)\tWinner");

  let crossoverFound = 0;

  for (const n of testSizes) {
    const arr = Array.from({ length: n }, (_, i) => i);

    const timeA = benchmark(() => hasDuplicateA(arr), 5);
    const timeB = benchmark(() => hasDuplicateB(arr), 5);

    const winner = timeA < timeB ? "A" : "B";
    console.log(`${n}\t${timeA.toFixed(3)}ms\t\t${timeB.toFixed(3)}ms\t\t${winner}`);

    if (crossoverFound === 0 && timeB < timeA) {
      crossoverFound = n;
    }
  }

  return crossoverFound;
}

const crossover = findCrossoverPoint();
console.log(`\n✅ Point de croisement : n ≈ ${crossover}`);
console.log("En dessous, O(n²) gagne grâce aux constantes faibles.");
console.log("Au dessus, O(n log n) domine de plus en plus.\n");

// =============================================================================
// PARTIE BONUS : Mesure de la consommation mémoire
// =============================================================================

console.log("--- Bonus : Consommation mémoire ---");

function benchmarkMemory(): void {
  const n = 100_000;

  const measurements: Array<{ name: string; bytes: number }> = [];

  // Array
  const heapBefore1 = process.memoryUsage().heapUsed;
  const testArr = Array.from({ length: n }, (_, i) => i);
  const heapAfter1 = process.memoryUsage().heapUsed;
  measurements.push({ name: "Array<number>", bytes: heapAfter1 - heapBefore1 });
  void testArr; // empêcher l'optimisation

  // Set
  const heapBefore2 = process.memoryUsage().heapUsed;
  const testSet = new Set(Array.from({ length: n }, (_, i) => i));
  const heapAfter2 = process.memoryUsage().heapUsed;
  measurements.push({ name: "Set<number>", bytes: heapAfter2 - heapBefore2 });
  void testSet;

  // Map
  const heapBefore3 = process.memoryUsage().heapUsed;
  const testMap = new Map(Array.from({ length: n }, (_, i) => [i, true] as const));
  const heapAfter3 = process.memoryUsage().heapUsed;
  measurements.push({ name: "Map<number, bool>", bytes: heapAfter3 - heapBefore3 });
  void testMap;

  console.log("Structure\t\tMémoire approx.");
  for (const m of measurements) {
    console.log(`${m.name}\t\t${(m.bytes / 1024 / 1024).toFixed(2)} MB`);
  }

  console.log("\n📊 Observation :");
  console.log("  Map > Set > Array en consommation mémoire");
  console.log("  Map stocke clé+valeur, Set stocke clé+hash, Array stocke valeur seule.");
  console.log("  → Choisir la structure selon le besoin : recherche rapide vs mémoire min.\n");
}

benchmarkMemory();

console.log("=== Fin du Lab 01 — SOLUTION ===");
